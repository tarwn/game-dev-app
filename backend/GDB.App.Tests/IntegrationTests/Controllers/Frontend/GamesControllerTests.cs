using FluentAssertions;
using GDB.App.Controllers.Frontend;
using GDB.App.Controllers.Frontend.Models.Games;
using GDB.Business.BusinessLogic;
using GDB.Common.Authentication;
using GDB.Common.DTOs.Game;
using GDB.Common.DTOs.Studio;
using GDB.Persistence;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.App.Tests.IntegrationTests.Controllers.Frontend
{

    [TestFixture]
    [Category("Database-Tests")]
    public class GamesControllerTests : IntegrationTestsBase
    {
        private GamesController _controller;
        private AccessibleStudio _existingStudio;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            Database.ClearDatabase();
            _existingStudio = Database.Studios.Add("GamesControllerTests");
        }

        [SetUp]
        public void BeforeEachTest()
        {
            var persistence = new DapperPersistence(Database.GetConnectionSettings());
            var busOps = new BusinessServiceOperatorWithRetry(persistence);
            var service = new InteractiveUserQueryService(busOps);
            _controller = new GamesController(service)
            {
                ControllerContext = GetControllerContextForFrontEnd(studioId: _existingStudio.Id)
            };
        }

        [Test]
        public async Task GetGamesAsync_NoParams_ReturnsAllGames()
        {
            var games = new List<GameDTO>(){
                Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc)),
                Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "name2", "logo url2", new DateTime(2022, 1, 2, 0, 0, 0, DateTimeKind.Utc)),
                Database.Games.Add(_existingStudio.Id, GameStatus.Developing, "name3", "logo url3", new DateTime(2022, 1, 3, 0, 0, 0, DateTimeKind.Utc))
            };

            var result = await _controller.GetGamesAsync();

            var resultList = AssertResponseIs<OkObjectResult, List<GameSummaryModel>>(result);
            resultList.OrderBy(g => g.GlobalId)
                .Should().HaveCount(3)
                .And.BeEquivalentTo(games.Select(g => new GameSummaryModel(g)).ToList());
        }

        [Test]
        public async Task GetGamesAsync_NoParams_DoesNotReturnGamesFromOtherStudios()
        {
            var studio2 = Database.Studios.Add("A Different Studio");
            var games = new List<GameDTO>(){
                Database.Games.Add(studio2.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc)),
                Database.Games.Add(studio2.Id, GameStatus.Idea, "name2", "logo url2", new DateTime(2022, 1, 2, 0, 0, 0, DateTimeKind.Utc)),
                Database.Games.Add(studio2.Id, GameStatus.Developing, "name3", "logo url3", new DateTime(2022, 1, 3, 0, 0, 0, DateTimeKind.Utc))
            };

            var result = await _controller.GetGamesAsync();

            var resultList = AssertResponseIs<OkObjectResult, List<GameSummaryModel>>(result);
            resultList.OrderBy(g => g.GlobalId)
                .Should().HaveCount(0);
        }
    }
}
