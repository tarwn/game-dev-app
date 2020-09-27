using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using CorrelationId;
using CorrelationId.DependencyInjection;
using GDB.App.ErrorHandling;
using GDB.App.HealthChecks;
using GDB.App.StartupConfiguration;
using GDB.Business.Authentication;
using GDB.Common.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.CookiePolicy;
using Microsoft.AspNetCore.Diagnostics.HealthChecks;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc.Razor;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Hosting;

namespace GDB.App
{
    public class Startup
    {
        public void ConfigureServices(IServiceCollection services)
        {
            // interactive security
            services.AddAntiforgery();
            services.AddAuthentication(SecurityConstants.CookieAuthScheme)
                .AddCookie(SecurityConstants.CookieAuthScheme, options =>
                {
                    options.LoginPath = "/account/login";
                    options.AccessDeniedPath = "/account/accessdenied";
                    options.LogoutPath = "/account/logout";
                });
            services.AddScoped<ISignInManager, SignInManager>();

            // Policies
            {
                // Cookie policies
                services.Configure<CookiePolicyOptions>(options =>
                {
                    options.MinimumSameSitePolicy = SameSiteMode.Strict;
                    options.HttpOnly = HttpOnlyPolicy.None;
                    options.Secure = CookieSecurePolicy.Always;
                });

                // Authorizations policies
                services.AddAuthorization(options =>
                {
                    options.AddPolicy(SecurityConstants.Policy_InteractiveUserAccess, builder =>
                    {
                        builder.RequireAuthenticatedUser();
                        builder.AuthenticationSchemes.Add(SecurityConstants.CookieAuthScheme);
                        builder.RequireClaim(SecurityConstants.Claim_SessionId);
                        builder.RequireClaim(SecurityConstants.Claim_UserId);
                        builder.RequireClaim(SecurityConstants.Claim_UserName);
                    });

                    options.DefaultPolicy = options.GetPolicy(SecurityConstants.Policy_InteractiveUserAccess);
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
                services.AddHealthChecks();

                // MVC 
                services.AddControllersWithViews(options => {
                    options.Filters.Add(new UnhandledApiExceptionFilter(new string[] { 
                        // add API endpoints here to automaically return non-HTML errors
                    }));
                });
                services.Configure<RazorViewEngineOptions>(o =>
                {
                    // {2} is area, {1} is controller,{0} is the action    
                    o.ViewLocationFormats.Clear();
                    o.ViewLocationFormats.Add("/Controllers/{1}/Views/{0}" + RazorViewEngine.ViewExtension);
                    o.AreaViewLocationFormats.Add("/Controllers/{2}/Views/{1}/{0}" + RazorViewEngine.ViewExtension);
                });

                // SPA
                //services.AddSpaStaticFiles(configuration =>
                //{
                //    configuration.RootPath = "ClientApp/build";
                //});
            }
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }
            else
            {
                app.UseExceptionHandler("/error");
                app.UseHsts();
            }
            app.UseHttpsRedirection();
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
                        await context.ChallengeAsync();
                    }
                    else
                    {
                        await next();
                    }
                });

                //app.UseSpaStaticFiles(new StaticFileOptions()
                //{
                //    OnPrepareResponse = ctx =>
                //    {
                //        if (ctx.Context.Request.Path.StartsWithSegments("/static"))
                //        {
                //            // Cache all static resources for 1 year (versioned filenames)
                //            var headers = ctx.Context.Response.GetTypedHeaders();
                //            headers.CacheControl = new CacheControlHeaderValue
                //            {
                //                Public = true,
                //                MaxAge = TimeSpan.FromDays(365)
                //            };
                //        }
                //        else
                //        {
                //            // Do not cache explicit `/index.html` or any other files.  See also: `DefaultPageStaticFileOptions` below for implicit "/index.html"
                //            var headers = ctx.Context.Response.GetTypedHeaders();
                //            headers.CacheControl = new CacheControlHeaderValue
                //            {
                //                Public = true,
                //                MaxAge = TimeSpan.FromDays(0)
                //            };
                //        }
                //    }
                //});
                //app.UseSpa(spa =>
                //{
                //    spa.Options.SourcePath = "ClientApp";
                //    spa.Options.DefaultPageStaticFileOptions = new StaticFileOptions()
                //    {
                //        OnPrepareResponse = ctx =>
                //        {
                //            // Do not cache implicit `/index.html`.  See also: `UseSpaStaticFiles` above
                //            var headers = ctx.Context.Response.GetTypedHeaders();
                //            headers.CacheControl = new CacheControlHeaderValue
                //            {
                //                Public = true,
                //                MaxAge = TimeSpan.FromDays(0)
                //            };
                //        }
                //    };

                //    if (env.IsDevelopment())
                //    {
                //        spa.UseReactDevelopmentServer(npmScript: "start");
                //    }
                //});
            }
        }
    }
}