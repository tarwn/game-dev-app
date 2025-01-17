using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Net;
using System.Net.Http;
using System.Net.Mail;
using System.Threading.Tasks;
using Azure.Identity;
using CorrelationId;
using CorrelationId.DependencyInjection;
using GDB.App.Controllers.Frontend;
using GDB.App.Controllers.General.Utility;
using GDB.App.ErrorHandling;
using GDB.App.HealthChecks;
using GDB.App.Security;
using GDB.App.StartupConfiguration;
using GDB.App.StartupConfiguration.Settings;
using GDB.Common.Persistence;
using GDB.Common.Settings;
using GDB.EmailSending;
using GDB.Persistence;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.AspNetCore.ResponseCompression;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;
using Microsoft.Net.Http.Headers;

namespace GDB.App
{
    public class Startup
    {
        private IConfiguration _configuration;
        private IWebHostEnvironment _environment;

        public Startup(IConfiguration configuration, IWebHostEnvironment environment)
        {
            _configuration = configuration;
            _environment = environment;
        }

        public void ConfigureServices(IServiceCollection services)
        {
            // Configurations
            services.Configure<AddressSettings>(_configuration.GetSection("Addresses"));
            services.Configure<DataProtectionSettings>(_configuration.GetSection("DataProtection"));
            services.Configure<SentryOptions>(_configuration.GetSection("Sentry"));
            services.Configure<StorageSettings>(_configuration.GetSection("Storage"));
            services.AddScoped<DatabaseConnectionSettings>((services) =>
            {
                return new DatabaseConnectionSettings() { Database = _configuration.GetConnectionString("Database") };
            });

            // Data
            services.AddScoped<IPersistence, DapperPersistence>();

            // Business/Domain Logic
            BusinessServiceConfiguration.Configure(services);

            // data protection
            if (!_environment.IsDevelopment())
            {
                services.AddDataProtection()
                    .PersistKeysToAzureBlobStorage(_configuration["Storage:ConnectionString"], _configuration["DataProtection:StorageKeyContainer"], _configuration["DataProtection:StorageKeyBlob"])
                    .ProtectKeysWithAzureKeyVault(new Uri(_configuration["DataProtection:KVKeyIdentifier"]), new DefaultAzureCredential());
            }

            // interactive security
            services.AddAntiforgery();
            services.AddAuthentication(SecurityConstants.CookieAuthScheme)
                .AddCookie(SecurityConstants.CookieAuthScheme, options =>
                {
                    options.LoginPath = "/account/login";
                    options.AccessDeniedPath = "/account/accessdenied";
                    options.LogoutPath = "/account/logout";
                });
            services.AddScoped<IAccountCookies, AccountCookies>();

            // Policies
            {
                // Cookie policies
                services.Configure<CookiePolicyOptions>(options =>
                {
                    // downgrade samesite for local development to prevent warnings cluttering up console when debugging on HTTP, etc
                    options.MinimumSameSitePolicy = _environment.IsDevelopment()
                        ? Microsoft.AspNetCore.Http.SameSiteMode.Lax
                        : Microsoft.AspNetCore.Http.SameSiteMode.Strict;
                    options.HttpOnly = HttpOnlyPolicy.None;
                    options.Secure = CookieSecurePolicy.Always;
                });

                // Authorizations policies
                services.AddAuthorization(options =>
                {
                    options.AddPolicy(Policies.InteractiveUserAccess, builder =>
                    {
                        builder.RequireAuthenticatedUser();
                        builder.AuthenticationSchemes.Add(SecurityConstants.CookieAuthScheme);
                        builder.RequireClaim(ClaimNames.SessionId);
                        builder.RequireClaim(ClaimNames.UserId);
                        builder.RequireClaim(ClaimNames.UserName);
                    });

                    options.DefaultPolicy = options.GetPolicy(Policies.InteractiveUserAccess);
                });

                // CORS policies
                services.AddCors(options =>
                {
                    options.AddPolicy(SecurityConstants.CORS_AllowAny, builder =>
                    {
                        builder.AllowAnyOrigin();
                    });
                });
            }

            // Endpoints
            {
                services.AddDefaultCorrelationId();

                // Health
                var healthChecks = services.AddHealthChecks()
                        .AddCheck<DatabaseHealthCheck>("database")
                        .AddCheck<StorageHealthCheck>("storage");
                if (!_environment.IsDevelopment())
                {
                    healthChecks.AddCheck<DataProtectionKeysHealthCheck>("dataprotection");
                }

                // MVC 
                var builder = services.AddControllersWithViews(options =>
                {
                    options.Filters.Add(new UnhandledApiExceptionFilter(new string[] {
                        "/api/fe"
                    }));
                });
                if (_environment.IsDevelopment())
                {
                    builder.AddRazorRuntimeCompilation();
                }
                services.Configure<RazorViewEngineOptions>(o =>
                {
                    // {2} is area, {1} is controller,{0} is the action    
                    o.ViewLocationFormats.Clear();
                    o.ViewLocationFormats.Add("/Controllers/{1}/Views/{0}" + RazorViewEngine.ViewExtension);
                    o.AreaViewLocationFormats.Add("/Controllers/{2}/Views/{1}/{0}" + RazorViewEngine.ViewExtension);
                });

                // SignalR
                services.AddSignalR();

                // SPA
                services.AddSpaStaticFiles(configuration =>
                {
                    configuration.RootPath = "ClientApp/dist";
                });
            }

            // Compression
            services.AddResponseCompression(options =>
            {
                options.EnableForHttps = true;
                options.Providers.Add<GzipCompressionProvider>();
                options.Providers.Add<BrotliCompressionProvider>();
            });

            //email notification service
            services.AddScoped<IEmailSender, EmailSender>();
            if (_configuration["Email:Method"].Equals("File"))
            {
                services.AddFluentEmail(_configuration["Email:FromAddress"], _configuration["Email:FromName"])
                        .AddRazorRenderer(typeof(EmailSender))
                        .AddSmtpSender(new SmtpClient
                        {
                            DeliveryMethod = SmtpDeliveryMethod.SpecifiedPickupDirectory,
                            PickupDirectoryLocation = Path.Combine(_environment.ContentRootPath, _configuration["Email:FilePath"])
                        });
            }
            else
            {
                services.AddFluentEmail(_configuration["Email:FromAddress"], _configuration["Email:FromName"])
                        .AddRazorRenderer(typeof(EmailSender))
                        .AddSmtpSender(new SmtpClient(_configuration["Email:Host"], int.Parse(_configuration["Email:Port"])) { 
                            EnableSsl = true,
                            Credentials = new NetworkCredential(_configuration["Email:Username"], _configuration["Email:Password"])
                        });
            }

            // Monitoring
            services.AddApplicationInsightsTelemetry();

            // SignalR Sender
            services.AddScoped<ISignalRSender, SignalRSender>();
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            // -- Development tasks
            if (env.IsDevelopment())
            {
                LocalDevelopmentTasks.MigrateDatabase(_configuration.GetConnectionString("Database"));
            }

            // -- Continue configuration
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/error");
                app.UseHsts();
                // only use HTTPS non-locally as livereload/ws proxying to node doesn't work w/ HTTPS
                app.UseHttpsRedirection();
            }
            app.UseResponseCompression();
            app.UseStaticFiles();

            app.UseRouting();

            app.UseCorrelationId();
            app.UseAuthentication();
            app.UseAuthorization();
            app.UseCors();

            app.UseEndpoints(endpoints =>
            {
                endpoints.MapHealthChecks("/health", new HealthCheckOptions()
                {
                    ResponseWriter = HealthCheckResponse.WriteResponse
                })
                .RequireCors(SecurityConstants.CORS_AllowAny);

                endpoints.MapHub<SignalRHub>("/api/fe/hub");
                endpoints.MapControllerRoute(name: "default", pattern: "{controller=Home}/{action=Index}/{id?}");
            });

            // Client SPA only from here forwards
            {
                // I haven't figured out how to apply a security policy
                //  from the Startup, so we'll do the default challenge and
                //  that does the right thing for now
                app.Use(async (context, next) =>
                {
                    if (!context.User.Identity.IsAuthenticated)
                    {
                        if (context.Request.Path.StartsWithSegments("/base.css") ||
                             context.Request.Path.StartsWithSegments("/fonts") ||
                             context.Request.Path.StartsWithSegments("/CircleArrow56.png") ||
                             (env.IsDevelopment() && context.Request.Path.Value.EndsWith(".js.map")))
                        {
                            await next();
                        }
                        else
                        {
                            await context.ChallengeAsync();
                        }
                    }
                    else
                    {
                        await next();
                    }
                });

                app.UseSpaStaticFiles(new StaticFileOptions()
                {
                    OnPrepareResponse = ctx =>
                    {
                        if (ctx.Context.Request.Path.StartsWithSegments("/static"))
                        {
                            // Cache all static resources for 1 year (versioned filenames)
                            var headers = ctx.Context.Response.GetTypedHeaders();
                            headers.CacheControl = new CacheControlHeaderValue
                            {
                                Public = true,
                                MaxAge = TimeSpan.FromDays(365)
                            };
                        }
                        else
                        {
                            // Do not cache explicit `/index.html` or any other files.  See also: `DefaultPageStaticFileOptions` below for implicit "/index.html"
                            var headers = ctx.Context.Response.GetTypedHeaders();
                            headers.CacheControl = new CacheControlHeaderValue
                            {
                                Public = true,
                                MaxAge = TimeSpan.FromDays(0)
                            };
                        }
                    }
                });
                app.UseSpa(spa =>
                {
                    spa.Options.DefaultPage = "/index.html";
                    spa.Options.DefaultPageStaticFileOptions = new StaticFileOptions()
                    {
                        OnPrepareResponse = ctx =>
                        {
                            // Do not cache implicit `/index.html`.  See also: `UseSpaStaticFiles` above
                            var headers = ctx.Context.Response.GetTypedHeaders();
                            headers.CacheControl = new CacheControlHeaderValue
                            {
                                Public = true,
                                MaxAge = TimeSpan.FromDays(0)
                            };
                        }
                    };

                    if (env.IsDevelopment())
                    {
                        spa.Options.DefaultPage = "/index.html";
                        spa.Options.StartupTimeout = TimeSpan.FromSeconds(120);
                        LocalDevelopmentTasks.StartFrontendService(spa, "../../frontend", "yarn", (port) => $"run dev", "Your application is ready");
                    }
                });
            }
        }
    }
}
