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
    [Route("api/fe/studio")]
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class StudioController : BaseController
    {
        private IInteractiveUserQueryService _userQueries;

        public StudioController(IInteractiveUserQueryService userQueries)
        {
            _userQueries = userQueries;
        }

        [HttpGet]
        public async Task<IActionResult> GetStudioAsync()
        {
            var user = GetUserAuthContext();
            var studio = await _userQueries.GetStudioAsync(user.StudioId, user);
            return Ok(studio);
        }
    }
}
