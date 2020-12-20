using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.Context
{
    public interface IAuthContext
    {
        public int UserId { get; }
        public int StudioId { get; }
    }
}
