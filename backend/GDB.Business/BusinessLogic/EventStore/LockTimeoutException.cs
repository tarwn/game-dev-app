using System;

namespace GDB.Business.BusinessLogic.EventStore
{
    public class LockTimeoutException : Exception
    {
        public LockTimeoutException(string message) : base(message) { }
    }
}
