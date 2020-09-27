using DbUp;
using GDB.Tools.DatabaseMigration.Utilities;
using GDB.Tools.DatabaseMigration.Utilities;
using GDB.Tools.DatabaseMigration.Utilities.Logging;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Reflection;
using System.Text;

namespace GDB.Tools.DatabaseMigration
{
    public class DatabaseMigrator
    {
        internal static List<LogEntry> UpgradeWithLog(string connectionString)
        {
            var logger = new StringLogger();

            var upgrader = DeployChanges.To
                .SqlDatabase(connectionString)
                .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
                .WithTransaction()
                .LogTo(logger)
                .LogScriptOutput()
                .Build();

            var sql = new SqlConnection(connectionString);
            var databaseName = sql.Database;

            string error;
            if (!upgrader.TryConnect(out error))
            {
                logger.WriteCriticalError($"Database Error: could not connect to '${databaseName}': ${error}");
                return logger.GetLog();
            }

            var result = upgrader.PerformUpgrade();
            if (!result.Successful)
            {
                logger.WriteCriticalError($"Database upgrade for '${databaseName}' failed with error: {result.Error}");
            }

            return logger.GetLog();
        }

        public static void UpgradeWithExceptions(string connectionString)
        {
            var upgrader = DeployChanges.To
                .SqlDatabase(connectionString)
                .WithScriptsEmbeddedInAssembly(Assembly.GetExecutingAssembly())
                .WithTransaction()
                .LogToConsole()
                .LogScriptOutput()
                .Build();

            string error;
            if (!upgrader.TryConnect(out error))
            {
                throw new Exception($"Database Error: could not connect to the test database provided: ${error}");
            }

            var result = upgrader.PerformUpgrade();

            if (!result.Successful)
            {
                throw new MigrationException($"Database upgrade failed with error: {result.Error}", result);
            }
        }

    }
}
