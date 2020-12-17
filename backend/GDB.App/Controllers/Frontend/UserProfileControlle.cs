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
    public class UserProfileController : Controller
    {
        private IInteractiveUserQueryService _userQueries;

        public UserProfileController(IInteractiveUserQueryService userQueries)
        {
            _userQueries = userQueries;
        }

        [HttpGet]
        public IActionResult GetUserProfile()
        {
            var profile = new { DisplayName = "Demo User" };
            return Ok(profile);
        }
    }
}
