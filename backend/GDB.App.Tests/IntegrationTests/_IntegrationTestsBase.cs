using GDB.App.Security;
using GDB.App.Tests.IntegrationTests.DataSetup;
using GDB.Tools.DatabaseMigration;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Configuration;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;

namespace GDB.App.Tests.IntegrationTests
{
    public class IntegrationTestsBase
    {
        private IntegrationConfiguration _configuration;

        public IntegrationTestsBase()
        {
            _configuration = GetApplicationConfiguration(TestContext.CurrentContext.TestDirectory);
            Database = new DatabaseHelper(_configuration.ConnectionStrings.Database);
        }

        [OneTimeSetUp]
        public void BaseSetup()
        {
            if (_configuration.AutomaticUpgrade)
            {
                LocalDatabaseMigrator.Execute(Database.GetConnectionString());
            }
        }

        [OneTimeTearDown]
        public void BaseTeardown()
        {
            Database.ClearDatabase();
        }

        public DatabaseHelper Database { get; }

        public DateTime GetDate(int? year = null, int? month = null, int? day = null)
        {
            var datetime = new DateTime(
                year.GetValueOrDefault(DateTime.UtcNow.Year),
                month.GetValueOrDefault(DateTime.UtcNow.Month),
                day.GetValueOrDefault(DateTime.UtcNow.Day));
            return DateTime.SpecifyKind(datetime, DateTimeKind.Utc);
        }

        protected ControllerContext GetControllerContextForFrontEnd(int userId = 1, string userName = "none", int sessionId = 2)
        {
            return new ControllerContext
            {
                HttpContext = new DefaultHttpContext()
                {
                    User = new ClaimsPrincipal(new ClaimsIdentity(new Claim[]
                        {
                            new Claim(ClaimNames.UserId, userId.ToString()),
                            new Claim(ClaimNames.UserName, userName),
                            new Claim(ClaimNames.SessionId, sessionId.ToString())
                        }))
                }
            };
        }

        public TContentType AssertResponseIs<TResultType, TContentType>(IActionResult result)
            where TResultType : ObjectResult
        {
            Assert.IsInstanceOf<TResultType>(result);
            var typedResult = (TResultType)result;
            Assert.IsInstanceOf<TContentType>(typedResult.Value);
            var typedContent = (TContentType)typedResult.Value;
            return typedContent;
        }

        public static IConfigurationRoot GetConfigurationRoot(string outputPath)
        {
            return new ConfigurationBuilder()
                .SetBasePath(outputPath)
                .AddJsonFile("appsettings.json", optional: true)
                .AddEnvironmentVariables()
                .Build();
        }

        public static IntegrationConfiguration GetApplicationConfiguration(string outputPath)
        {
            var configuration = new IntegrationConfiguration();

            var config = GetConfigurationRoot(outputPath);

            config.Bind(configuration);

            return configuration;
        }

        public static DateTime UtcDate(int year, int month, int day)
        {
            return new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);
        }
    }

    public class IntegrationConfiguration
    {
        public IntegrationConnectionStrings ConnectionStrings { get; set; }
        public bool AutomaticUpgrade { get; set; }
    }

    public class IntegrationConnectionStrings
    {
        public string Database { get; set; }
    }
}
