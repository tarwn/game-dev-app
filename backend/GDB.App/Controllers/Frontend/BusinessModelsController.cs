using GDB.App.Controllers.Frontend.Models.BusinessModel;
using GDB.App.Security;
using GDB.Common.BusinessLogic;
using GDB.Common.DTOs.BusinessModel;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{

    [Route("api/fe/businessModels")]
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class BusinessModelsController : BaseController
    {
        private IInteractiveUserQueryService _queryService;
        private IBusinessModelService _businessModelService;
        private IHubContext<SignalRHub> _hubContext;

        public BusinessModelsController(IInteractiveUserQueryService queryService, IBusinessModelService businessModelService, IHubContext<SignalRHub> hubContext)
        {
            _queryService = queryService;
            _businessModelService = businessModelService;
            _hubContext = hubContext;
        }

        [HttpGet("{gameId}")]
        public async Task<IActionResult> GetByIdAsync(string gameId)
        {
            var user = GetUserAuthContext();
            var dto = await _businessModelService.GetOrCreateAsync(gameId, user);
            if (dto == null)
            {
                return NotFound();
            }
            return Ok(dto);
        }

        [HttpGet("{gameId}/since/{versionNumber}")]
        public async Task<IActionResult> GetSinceByIdAsync(string gameId, int versionNumber)
        {
            var user = GetUserAuthContext();
            var events = await _businessModelService.GetSinceAsync(gameId, versionNumber, user);
            if (events == null)
            {
                return NotFound();
            }
            return Ok(new SinceResponseModel(gameId, events));
        }

        [HttpPost("{gameId}")]
        public async Task<IActionResult> UpdateAsync(string gameId, [FromBody] IncomingBusinessModelChangeEvent change)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = GetUserAuthContext();
            var savedEvent = await _businessModelService.ApplyEventAsync(gameId, change, user);
            await _hubContext.Clients.Group(gameId).SendAsync("businessModelUpdate", savedEvent);
            return Ok(savedEvent);
        }
    }
}
