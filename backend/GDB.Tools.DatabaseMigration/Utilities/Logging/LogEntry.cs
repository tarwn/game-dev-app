using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Tools.DatabaseMigration.Utilities.Logging
{
    public class LogEntry
    {

        public LogEntry(LogType entryType, string message)
        {
            EntryType = entryType;
            Message = message;
        }

        public LogType EntryType { get; }

        public string Message { get; }
    }
}
