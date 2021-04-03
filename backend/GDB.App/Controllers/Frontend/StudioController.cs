using GDB.App.Controllers.Frontend.Models.Studio;
using GDB.App.Security;
using GDB.Common.BusinessLogic;
using GDB.Common.DTOs.Studio;
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
        private IStudioService _studioService;
        private ISignalRSender _signalrSender;

        public StudioController(IInteractiveUserQueryService userQueries, IStudioService studioService, ISignalRSender signalrSender)
        {
            _userQueries = userQueries;
            _studioService = studioService;
            _signalrSender = signalrSender;
        }

        [HttpGet]
        public async Task<IActionResult> GetStudioAsync()
        {
            var user = GetUserAuthContext();
            var studio = await _userQueries.GetStudioAsync(user.StudioId, user);
            return Ok(studio);
        }


        [HttpGet("users")]
        public async Task<IActionResult> GetStudioUsersAsync()
        {
            var user = GetUserAuthContext();
            var users = await _userQueries.GetStudioUsersAsync(user.StudioId, user);
            return Ok(users);
        }

        [HttpPost]
        public async Task<IActionResult> UpdateStudioAsync([FromBody] UpdateStudioRequestModel update)
        {
            if (string.IsNullOrEmpty(update.Name))
            {
                ModelState.AddModelError("", "At least one field must be set in an update");
                return BadRequest(ModelState);
            }

            var user = GetUserAuthContext();
            var updateDto = new UpdateStudioDTO()
            {
                Name = update.Name
            };
            await _studioService.UpdateStudioAsync(updateDto, user);
            await _signalrSender.SendAsync(user, UpdateScope.StudioRecord, null);
            return Ok();
        }

    }
}
