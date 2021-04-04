using GDB.Common.Context;
using GDB.Common.DTOs.Studio;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    public class UserAuthContext : IAuthContext
    {
        public UserAuthContext(int sessionId, int userId, string username, int studioId, StudioUserRole role)
        {
            SessionId = sessionId;
            UserId = userId;
            Username = username;
            StudioId = studioId;
            Role = role;
        }

        public int SessionId { get; }
        public int UserId { get; }
        public string Username { get; }
        public int StudioId { get; }
        public StudioUserRole Role { get; }
    }
}
