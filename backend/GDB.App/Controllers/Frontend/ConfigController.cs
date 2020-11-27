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
using System.Text;
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
            // temporary - random string for actor id which needs to be unique for 
            //  all users operating simultaneously on the same game
            var actorId = RandomString(6);
            var version = Assembly.GetExecutingAssembly().GetName().Version;
            var config = @"
                window.config = {
                    environment: """ + _webHostEnvironment.EnvironmentName + @""",
                    version: """ + version + @""",
                    sessionId: ""n/a"",
                    isFullUser: false,
                    actorId: """ + actorId + @""",
                    sentry: {
                        dsn: """ + _sentryConfig.Value.Dsn + @"""
                    }
                }
            ";
            return Ok(config);
        }


        // temporary
        //  https://stackoverflow.com/questions/1122483/random-string-generator-returning-same-string
        private static Random random = new Random((int)DateTime.Now.Ticks);//thanks to McAden
        private string RandomString(int size)
        {
            StringBuilder builder = new StringBuilder();
            char ch;
            for (int i = 0; i < size; i++)
            {
                ch = Convert.ToChar(Convert.ToInt32(Math.Floor(26 * random.NextDouble() + 65)));
                builder.Append(ch);
            }

            return builder.ToString();
        }
    }
}
