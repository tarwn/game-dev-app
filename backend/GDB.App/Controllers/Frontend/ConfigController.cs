using GDB.App.Security;
using GDB.App.StartupConfiguration.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    [Route("api/fe/config")]
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class ConfigController : Controller
    {
        private IOptions<SentryOptions> _sentryConfig;
        private IWebHostEnvironment _webHostEnvironment;

        public ConfigController(IOptions<SentryOptions> sentryConfig, IWebHostEnvironment webHostEnvironment)
        {
            _sentryConfig = sentryConfig;
            _webHostEnvironment = webHostEnvironment;
        }

        [HttpGet]
        public IActionResult GetConfig()
        {
            var version = Assembly.GetExecutingAssembly().GetName().Version;
            var config = @"
                window.config = {
                    environment: """ + _webHostEnvironment.EnvironmentName + @""",
                    version: """ + version + @""",
                    sentry: {
                        dsn: """ + _sentryConfig.Value.Dsn + @"""
                    }
                }
            ";
            return Ok(config);
        }
    }
}
