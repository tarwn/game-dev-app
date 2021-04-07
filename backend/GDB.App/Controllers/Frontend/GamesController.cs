using GDB.App.Controllers.Frontend.Models.Games;
using GDB.App.Security;
using GDB.Business.BusinessLogic;
using GDB.Common.BusinessLogic;
using GDB.Common.DTOs.Game;
using Microsoft.ApplicationInsights;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    [Route("api/fe/games")]
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class GamesController : BaseController
    {
        private IInteractiveUserQueryService _userQueries;
        private IGameService _gameService;
        private ISignalRSender _signalrSender;
        private TelemetryClient _telemetryClient;

        public GamesController(IInteractiveUserQueryService userQueries, IGameService gameService, ISignalRSender signalrSender, TelemetryClient telemetryClient)
        {
            _userQueries = userQueries;
            _gameService = gameService;
            _signalrSender = signalrSender;
            _telemetryClient = telemetryClient;
        }

        [HttpGet]
        public async Task<IActionResult> GetGamesAsync()
        {
            var user = GetUserAuthContext();
            var games = await _userQueries.GetAllGamesAsync(user);
            var result = games.Select(game => new GameDetailsModel(game)).ToList();
            return Ok(result);
        }

        [HttpGet("summary")]
        public async Task<IActionResult> GetGamesSummariesAsync()
        {
            var user = GetUserAuthContext();
            var games = await _userQueries.GetAllGamesAsync(user);
            var result = games.Select(game => new GameSummaryModel(game)).ToList();
            return Ok(result);
        }

        [HttpGet("{globalId}")]
        public async Task<IActionResult> GetGameAsync(string globalId)
        {
            var user = GetUserAuthContext();
            var id = IdHelper.CheckAndExtractGameId(globalId, user);
            var game = await _userQueries.GetGameAsync(id, user);
            return Ok(game);
        }

        [HttpPost("new")]
        public async Task<IActionResult> CreateGameAsync()
        {
            var user = GetUserAuthContext();
            var game = await _gameService.CreateGameAsync(user);
            await _signalrSender.SendAsync(user, UpdateScope.StudioGameList, new { GameId = game.GetGlobalId() });
            return Ok(game);
        }

        [HttpPost("{globalId}")]
        public async Task<IActionResult> UpdateGameAsync(string globalId, [FromBody] UpdateGameRequestModel update)
        {
            _telemetryClient?.TrackEvent("UpdateGameAsync-Started");

            if (!update.IsFavorite.HasValue && !update.LaunchDate.HasValue && !update.Status.HasValue && string.IsNullOrEmpty(update.Name))
            {
                ModelState.AddModelError("", "At least one field must be specified in order to perform an update");
                return BadRequest(ModelState);
            }

            var user = GetUserAuthContext();
            var id = IdHelper.CheckAndExtractGameId(globalId, user);
            var updateDto = new UpdateGameDTO()
            {
                IsFavorite = update.IsFavorite,
                Name = update.Name,
                LaunchDate = update.LaunchDate.HasValue ? update.LaunchDate.Value.ToUniversalTime() : (DateTime?)null,
                Status = update.Status
            };
            _telemetryClient?.TrackEvent("UpdateGameAsync-CallingUpdate");
            await _gameService.UpdateGameAsync(id, updateDto, user);
            _telemetryClient?.TrackEvent("UpdateGameAsync-CallingSignalR");
            await _signalrSender.SendAsync(user, UpdateScope.StudioGameList, new { GameId = globalId });
            _telemetryClient?.TrackEvent("UpdateGameAsync-Complete");
            return Ok();
        }

        [HttpDelete("{globalId}")]
        public async Task<IActionResult> DeleteGameAsync(string globalId)
        {
            var user = GetUserAuthContext();
            var id = IdHelper.CheckAndExtractGameId(globalId, user);
            await _gameService.DeleteGameAsync(id, user);
            await _signalrSender.SendAsync(user, UpdateScope.StudioGameList, new { GameId = globalId });
            return Ok();
        }
    }
}
