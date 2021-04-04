using GDB.Common.Context;
using GDB.Common.DTOs.Studio;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Business.Tests.Utilities
{
    public class TestAuthContext : IAuthContext
    {
        public TestAuthContext(int userId, int studioId, StudioUserRole role)
        {
            UserId = userId;
            StudioId = studioId;
            Role = role;
        }

        public int UserId { get; }
        public int StudioId { get; }
        public StudioUserRole Role { get; }
    }
}
