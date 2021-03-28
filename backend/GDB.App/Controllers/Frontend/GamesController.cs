using GDB.App.Controllers.Frontend.Models.Games;
using GDB.App.Security;
using GDB.Business.BusinessLogic;
using GDB.Common.BusinessLogic;
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

        public GamesController(IInteractiveUserQueryService userQueries)
        {
            _userQueries = userQueries;
        }

        [HttpGet]
        public async Task<IActionResult> GetGamesAsync()
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
    }
}
