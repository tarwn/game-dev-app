using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Authorization
{
    public class MismatchedIdsException : Exception
    {
        public MismatchedIdsException(string userReadableMessage, string internalMessage)
            : base(userReadableMessage)
        {
            Data["RealError"] = internalMessage;
        }
    }
}
