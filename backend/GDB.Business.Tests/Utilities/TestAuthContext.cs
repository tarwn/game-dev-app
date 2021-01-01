using GDB.Common.Context;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Business.Tests.Utilities
{
    public class TestAuthContext : IAuthContext
    {
        public TestAuthContext(int userId, int studioId)
        {
            UserId = userId;
            StudioId = studioId;
        }

        public int UserId { get; }
        public int StudioId { get; }
    }
}
