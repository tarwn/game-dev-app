using GDB.App.Security;
using GDB.App.StartupConfiguration.Settings;
using GDB.Common.BusinessLogic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Reflection;
using System.Text;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    [Route("api/fe/config")]
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class ConfigController : BaseController
    {
        private IOptions<SentryOptions> _sentryConfig;
        private IWebHostEnvironment _webHostEnvironment;
        private IActorService _actorService;

        public ConfigController(IOptions<SentryOptions> sentryConfig, IWebHostEnvironment webHostEnvironment, IActorService actorService)
        {
            _sentryConfig = sentryConfig;
            _webHostEnvironment = webHostEnvironment;
            _actorService = actorService;
        }

        [HttpGet]
        public async Task<IActionResult> GetConfigAsync()
        {
            var user = GetUserAuthContext();
            var actorId = await _actorService.GetActorAsync(user);

            var version = Assembly.GetExecutingAssembly().GetName().Version;
            var config = @"
                window.config = {
                    environment: """ + _webHostEnvironment.EnvironmentName + @""",
                    version: """ + version + @""",
                    sessionId: """ + user.SessionId + @""",
                    actorId: """ + actorId + @""",
                    userId: " + user.UserId + @",
                    sentry: {
                        dsn: """ + _sentryConfig.Value.Dsn + @"""
                    }
                }
            ";
            return Ok(config);
        }

    }
}
