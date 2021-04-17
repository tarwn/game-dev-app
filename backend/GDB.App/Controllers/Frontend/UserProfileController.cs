using GDB.App.Controllers.Frontend.Models.UserProfile;
using GDB.App.Security;
using GDB.Common.BusinessLogic;
using GDB.Common.DTOs.User;
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
        private IUserService _userService;
        private ISignalRSender _signalrSender;

        public UserProfileController(IInteractiveUserQueryService userQueries, IUserService userService, ISignalRSender signalrSender)
        {
            _userQueries = userQueries;
            _userService = userService;
            _signalrSender = signalrSender;
        }

        [HttpGet]
        public async Task<IActionResult> GetUserProfileAsync()
        {
            var authUser = GetUserAuthContext();
            var user = await _userQueries.GetUserAsync(authUser.UserId, authUser);

            var profile = new UserProfileModel(user);
            return Ok(profile);
        }


        [HttpPost]
        public async Task<IActionResult> UpdateUserProfileAsync([FromBody] UpdateUserProfileRequestModel model)
        {
            var authUser = GetUserAuthContext();
            if (authUser.UserId != model.Id)
            {
                ModelState.AddModelError("", "Specified user is not who you are currently logged in as");
                return BadRequest(ModelState);
            }
            var update = new UserUpdateDTO()
            {
                HasSeenPopup = model.HasSeenPopup
            };
            await _userService.UpdateAsync(model.Id, update, authUser);
            await _signalrSender.SendAsync(authUser, UpdateScope.CurrentUserRecord, new { model.Id });
            return Ok();
        }
    }
}
