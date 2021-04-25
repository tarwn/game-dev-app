using GDB.App.Controllers.Frontend.Models.BusinessModel;
using GDB.App.Security;
using GDB.Common.BusinessLogic;
using GDB.Common.DTOs._Events;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{

    [Route("api/fe/cashForecasts")]
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class CashForecastsController : BaseController
    {
        private IInteractiveUserQueryService _queryService;
        private ICashForecastService _cashForecastService;
        private ISignalRSender _signalrSender;

        public CashForecastsController(IInteractiveUserQueryService queryService, ICashForecastService cashForecastService, ISignalRSender signalrSender)
        {
            _queryService = queryService;
            _cashForecastService = cashForecastService;
            _signalrSender = signalrSender;
        }

        [HttpGet("{gameId}")]
        public async Task<IActionResult> GetByIdAsync(string gameId, [FromQuery] bool? skipCreate)
        {
            var user = GetUserAuthContext();
            var dto = await _cashForecastService.GetOrCreateAsync(gameId, skipCreate ?? false, user);
            if (dto == null)
            {
                if (skipCreate.GetValueOrDefault(false))
                {
                    return NoContent();
                }
                else
                {
                    return NotFound();
                }
            }
            return Ok(dto);
        }

        [HttpGet("{gameId}/since/{versionNumber}")]
        public async Task<IActionResult> GetSinceByIdAsync(string gameId, int versionNumber)
        {
            var user = GetUserAuthContext();
            var events = await _cashForecastService.GetSinceAsync(gameId, versionNumber, user);
            if (events == null)
            {
                return NotFound();
            }
            return Ok(new SinceResponseModel(gameId, events));
        }

        [HttpPost("{gameId}")]
        public async Task<IActionResult> UpdateAsync(string gameId, [FromBody] IncomingChangeEvent change)
        {
            if (!ModelState.IsValid)
            {
                return BadRequest(ModelState);
            }

            var user = GetUserAuthContext();
            var savedEvent = await _cashForecastService.ApplyEventAsync(gameId, change, user);
            await _signalrSender.SendAsync(user, UpdateScope.GameCashforecast, gameId, savedEvent);
            return Ok(savedEvent);
        }
    }
}
