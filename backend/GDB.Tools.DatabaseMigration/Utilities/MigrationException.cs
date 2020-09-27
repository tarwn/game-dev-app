using DbUp.Engine;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Tools.DatabaseMigration.Utilities
{
    public class MigrationException : Exception
    {
        public MigrationException(string message, DatabaseUpgradeResult result)
            : base(message)
        {
            Result = result;
        }

        public DatabaseUpgradeResult Result { get; }
    }
}
