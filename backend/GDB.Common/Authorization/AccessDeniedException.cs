using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.Authorization
{
    public class AccessDeniedException : Exception
    {
        public AccessDeniedException(string userReadableMessage, string internalMessage)
            : base(userReadableMessage)
        {
            Data["RealError"] = internalMessage;
        }
    }
}
