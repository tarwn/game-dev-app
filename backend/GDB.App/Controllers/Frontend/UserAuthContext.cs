using GDB.Common.Context;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    public class UserAuthContext : IAuthContext
    {
        public UserAuthContext(int sessionId, int userId, string username, int studioId)
        {
            SessionId = sessionId;
            UserId = userId;
            Username = username;
            StudioId = studioId;
        }

        public int SessionId { get; }
        public int UserId { get; }
        public string Username { get; }
        public int StudioId { get; }
    }
}
