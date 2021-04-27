using FluentAssertions;
using GDB.App.Controllers.Frontend;
using GDB.App.Controllers.Frontend.Models.Tasks;
using GDB.Business.BusinessLogic;
using GDB.Common.Authentication;
using GDB.Common.DTOs.Game;
using GDB.Common.DTOs.Studio;
using GDB.Common.DTOs.Task;
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
    public class GameTasksControllerTests : IntegrationTestsBase
    {
        private AccessibleStudio _existingStudio;
        private User _user;
        //private Dictionary<StudioUserRole, User> _users = new Dictionary<StudioUserRole, User>();

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            Database.ClearDatabase();
            // studio + user for these tests
            _existingStudio = Database.Studios.Add("GamesControllerTests");
            _user = Database.Users.Add("GamesControllerTests", "GamesControllerTests", "GamesControllerTests", false);
            Database.Studios.AssignUserAccesstoStudio(_user.Id, _existingStudio.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator);
        }

        public GameTasksController GetController(int? userId = null, int? studioId = null, StudioUserRole? role = null)
        {
            var persistence = new DapperPersistence(Database.GetConnectionSettings());
            var busOps = new BusinessServiceOperatorWithRetry(persistence);
            var queryService = new InteractiveUserQueryService(busOps);
            //var gamesService = new GameService(busOps);
            //var signalrService = new Mock<ISignalRSender>().Object;
            return new GameTasksController(queryService)
            {
                ControllerContext = GetControllerContextForFrontEnd(userId: userId ?? _user.Id, studioId: studioId ?? _existingStudio.Id, role: role ?? StudioUserRole.Administrator)
            };
        }

        [Test]
        public async Task GetOpenTasksAsync_FreshGameInIdeaStage_ReturnsAllIdeaStageTasks()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "Idea Test");
            var controller = GetController(studioId: _existingStudio.Id);

            var result = await controller.GetOpenTasksAsync(game.GetGlobalId());

            var resultList = AssertResponseIs<OkObjectResult, List<TaskModel>>(result);
            resultList.Should().HaveCount(4);
            resultList.Select(r => r.TaskType).Should().BeEquivalentTo(TaskType.Concept, TaskType.Groundwork, TaskType.Goals, TaskType.BusinessModel);
            resultList.Select(r => r.TaskState).Distinct().Should().BeEquivalentTo(TaskState.Open);
        }

        [Test]
        public async Task GetOpenTasksAsync_GameInIdeaStageWithSomeClosedTasks_ReturnsOpenIdeaStageTasks()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "Idea Test");
            Database.Games.CloseTask(game.Id, TaskType.Concept);
            var controller = GetController(studioId: _existingStudio.Id);

            var result = await controller.GetOpenTasksAsync(game.GetGlobalId());

            var resultList = AssertResponseIs<OkObjectResult, List<TaskModel>>(result);
            resultList.Should().HaveCount(4 - 1);
            resultList.Select(r => r.TaskType).Should().BeEquivalentTo(/*TaskType.Concept, */TaskType.Groundwork, TaskType.Goals, TaskType.BusinessModel);
            resultList.Select(r => r.TaskState).Distinct().Should().BeEquivalentTo(TaskState.Open);
        }

        [Test]
        public async Task GetOpenTasksAsync_GameInIdeaStageWithAllClosedTasks_ReturnsEmptyTaskList()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "Idea Test");
            Database.Games.CloseTask(game.Id, TaskType.Concept);
            Database.Games.CloseTask(game.Id, TaskType.Groundwork);
            Database.Games.CloseTask(game.Id, TaskType.Goals);
            Database.Games.CloseTask(game.Id, TaskType.BusinessModel);
            var controller = GetController(studioId: _existingStudio.Id);

            var result = await controller.GetOpenTasksAsync(game.GetGlobalId());

            var resultList = AssertResponseIs<OkObjectResult, List<TaskModel>>(result);
            resultList.Should().HaveCount(0);
        }

        [Test]
        public async Task GetOpenTasksAsync_FreshGameInPlanningStage_ReturnsAllPlanningStageTasks()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Planning, "Planning Test");
            var controller = GetController(studioId: _existingStudio.Id);

            var result = await controller.GetOpenTasksAsync(game.GetGlobalId());

            var resultList = AssertResponseIs<OkObjectResult, List<TaskModel>>(result);
            resultList.Should().HaveCount(6);
            resultList.Select(r => r.TaskType).Should().BeEquivalentTo(TaskType.RiskAnalysis, TaskType.ProjectPlan, TaskType.CostForecast, TaskType.Comparables, TaskType.ProfitForecast, TaskType.MarketingStrategy);
            resultList.Select(r => r.TaskState).Distinct().Should().BeEquivalentTo(TaskState.Open);
        }

        [Test]
        public async Task GetAllTasksAsync_FreshGameInIdeaStage_ReturnsAllTasks()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "Idea Test");
            var controller = GetController(studioId: _existingStudio.Id);

            var result = await controller.GetAllTasksAsync(game.GetGlobalId());

            var resultList = AssertResponseIs<OkObjectResult, List<TaskModel>>(result);
            resultList.Should().HaveCount(10);
            resultList.Select(r => r.TaskState).Distinct().Should().BeEquivalentTo(TaskState.Open);
        }

        [Test]
        public async Task GetAllTasksAsync_GameInIdeaStageWithSomeClosedTasks_ReturnsAllTasks()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "Idea Test");
            Database.Games.CloseTask(game.Id, TaskType.Concept, TaskState.ClosedComplete);
            var controller = GetController(studioId: _existingStudio.Id);

            var result = await controller.GetAllTasksAsync(game.GetGlobalId());

            var resultList = AssertResponseIs<OkObjectResult, List<TaskModel>>(result);
            resultList.Should().HaveCount(10);
            resultList.Select(r => r.TaskState).Distinct().Should().BeEquivalentTo(TaskState.Open, TaskState.ClosedComplete);
        }
    }
}
