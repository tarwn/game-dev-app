using GDB.App.Controllers.Frontend.Models;
using GDB.App.Security;
using GDB.Common.Authorization;
using GDB.Common.BusinessLogic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    [Route("api/fe/actors")]
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class ActorController : BaseController
    {
        private IActorService _actorService;

        public ActorController(IActorService actorService)
        {
            _actorService = actorService;
        }

        [HttpGet("{actor}/latestSeqNo")]
        public async Task<IActionResult> GetLatestSeqNoAsync(string actor)
        {
            try
            {
                var user = GetUserAuthContext();
                var result = await _actorService.GetLatestSeqNoAsync(actor, user);
                return Ok(new LatestSeqNoModel()
                {
                    Actor = actor,
                    SeqNo = result
                });
            }
            catch (AccessDeniedException a)
            {
                return BadRequest(new BadRequestResponseModel(a.Message));
            }
        }
    }
}
