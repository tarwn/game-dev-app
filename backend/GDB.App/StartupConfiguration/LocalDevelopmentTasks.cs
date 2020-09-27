using GDB.Tools.DatabaseMigration;
using Microsoft.Extensions.Configuration;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.StartupConfiguration
{
    public class LocalDevelopmentTasks
    {
        internal static void MigrateDatabase(IConfiguration configuration)
        {
            LocalDatabaseMigrator.Execute(configuration.GetConnectionString("Database"));
        }
    }
}
