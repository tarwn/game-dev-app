using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GDB.Tools.DatabaseMigration;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;

namespace GDB.App
{
    public class Program
    {
        public static void Main(string[] args)
        {
            CreateHostBuilder(args).Build().Run();
        }

        public static IHostBuilder CreateHostBuilder(string[] args) =>
            Host.CreateDefaultBuilder(args)
                .ConfigureWebHostDefaults(webBuilder =>
                {
                    webBuilder.UseSentry(options =>
                    {
                        options.MinimumEventLevel = LogLevel.Error;
                        options.DiagnosticsLevel = Sentry.Protocol.SentryLevel.Error;
                        options.BeforeSend = @event => {
#if DEBUG
                            return null;
#endif
                            return @event;
                        };
                    });
                    webBuilder.UseStartup<Startup>();
                });
    }
}
