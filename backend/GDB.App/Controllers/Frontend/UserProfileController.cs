using GDB.App.Security;
using GDB.Common.BusinessLogic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    [Route("api/fe/userProfile")]
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class UserProfileController : BaseController
    {
        private IInteractiveUserQueryService _userQueries;

        public UserProfileController(IInteractiveUserQueryService userQueries)
        {
            _userQueries = userQueries;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserProfile()
        {
            var authUser = GetUserAuthContext();
            var user = await _userQueries.GetUserAsync(authUser.UserId, authUser);

            var profile = new { 
                UserName = user.UserName,
                DisplayName = user.DisplayName
            };
            return Ok(profile);
        }
    }
}
