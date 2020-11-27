using GDB.App.Controllers.Frontend.Models;
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
    [Route("api/fe/actors")]
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class ActorController : Controller
    {
        private IBusinessModelService _businessModelService;

        public ActorController(IBusinessModelService businessModelService)
        {
            _businessModelService = businessModelService;
        }

        [HttpGet("{actor}/latestSeqNo")]
        public async Task<IActionResult> GetLatestSeqNoAsync(string actor)
        {
            var user = new UserAuthContext();
            var result = await _businessModelService.GetLatestSeqNoAsync(actor);
            return Ok(new LatestSeqNoModel()
            {
                Actor = actor,
                SeqNo = result.GetValueOrDefault(0)
            }); ;
        }
    }
}
