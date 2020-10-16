using GDB.App.Security;
using GDB.App.StartupConfiguration.Settings;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    [Route("api/fe/config")]
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class ConfigController : Controller
    {
        private IOptions<SentryOptions> _sentryConfig;

        public ConfigController(IOptions<SentryOptions> sentryConfig)
        {
            _sentryConfig = sentryConfig;
        }

        [HttpGet]
        public IActionResult GetConfig()
        {
            var config = @"
                window.config = {
                    sentry: {
                        dsn: """ + _sentryConfig.Value.Dsn + @"""
                    }
                }
            ";
            return Ok(config);
        }
    }
}
