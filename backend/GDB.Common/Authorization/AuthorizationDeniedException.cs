using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.Authorization
{
    public class AuthorizationDeniedException : Exception
    {
        public AuthorizationDeniedException(string userReadableMessage, string internalMessage)
            : base(userReadableMessage)
        {
            Data["RealError"] = internalMessage;
        }
    }
}
