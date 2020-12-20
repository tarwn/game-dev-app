using GDB.App.Security;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    public class BaseController : Controller
    {
        public UserAuthContext GetUserAuthContext()
        {
            var userId = int.Parse(User.FindFirst(ClaimNames.UserId).Value);
            var username = User.FindFirst(ClaimNames.UserName).Value;
            var sessionId = int.Parse(User.FindFirst(ClaimNames.SessionId).Value);
            var studioId = int.Parse(User.FindFirst(ClaimNames.StudioId).Value);

            return new UserAuthContext(sessionId, userId, username, studioId);
        }
    }
}
