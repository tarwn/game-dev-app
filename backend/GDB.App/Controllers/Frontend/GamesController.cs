using GDB.App.Controllers.Frontend.Models.Games;
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
        public IActionResult GetGames()
        {
            var user = GetUserAuthContext();
            var games = new List<GameSummaryModel>() {
                new GameSummaryModel(){ GlobalId = $"{user.StudioId}:demo", Name="Demo Game", Status="Active", LastModified="5 minutes ago" },
                new GameSummaryModel(){ GlobalId = $"{user.StudioId}:ex1", Name="Example Game", Status="Active", LastModified="3 days ago" },
                new GameSummaryModel(){ GlobalId = $"{user.StudioId}:ex2", Name="Another Game", Status="Active", LastModified="4 days ago" },
            };
            return Ok(games);
        }
    }
}
