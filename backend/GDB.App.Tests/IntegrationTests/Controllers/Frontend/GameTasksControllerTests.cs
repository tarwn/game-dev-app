using Dapper;
using FluentAssertions;
using GDB.App.Controllers.Frontend;
using GDB.App.Controllers.Frontend.Models.Tasks;
using GDB.Business.BusinessLogic;
using GDB.Common.Authentication;
using GDB.Common.Authorization;
using GDB.Common.DTOs.Game;
using GDB.Common.DTOs.Studio;
using GDB.Common.DTOs.Task;
using GDB.Persistence;
using Microsoft.AspNetCore.Mvc;
using Moq;
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
            var tasksService = new TaskService(busOps, persistence);
            var signalrService = new Mock<ISignalRSender>().Object;
            return new GameTasksController(queryService, tasksService, signalrService)
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

        [Test]
        public async Task AssignTaskAsync_GameAnTaskWithoutPriorAssignment_AssignsTaskForUser()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "Whatever");
            var taskId = 0;
            using (var conn = Database.GetConnection())
            {
                taskId = conn.QuerySingle<int>("SELECT TOP 1 Id FROM GameTask WHERE GameId = @Id", game);
            }
            var controller = GetController(studioId: _existingStudio.Id);

            var result = await controller.AssignTaskAsync(game.GetGlobalId(), taskId);

            result.Should().BeOfType<OkResult>();
        }

        [Test]
        public async Task AssignTaskAsync_GameAndTaskWithPriorAssignment_AssignsTaskForUser()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "Whatever");
            var taskIds = new List<int>();
            using (var conn = Database.GetConnection())
            {
                taskIds = conn.Query<int>("SELECT Id FROM GameTask WHERE GameId = @Id", game).ToList();
            }
            var controller = GetController(studioId: _existingStudio.Id);

            var result = await controller.AssignTaskAsync(game.GetGlobalId(), taskIds[0]);
            result = await controller.AssignTaskAsync(game.GetGlobalId(), taskIds[1]);

            result.Should().BeOfType<OkResult>();
            using (var conn = Database.GetConnection())
            {
                var dbAssignment = conn.Query<int>("SELECT GameTaskId FROM GameTaskAssignment WHERE GameId = @GameId AND UserId = @UserId", new { 
                    gameId = game.Id,
                    userId = _user.Id                
                });
                dbAssignment.Should().Equal(taskIds[1]);
            }
        }

        [Test]
        public void AssignTaskAsync_MisMatchedGameAndTask_ReturnsError()
        {
            var game1 = Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "Whatever");
            var game2 = Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "Whatever");
            var taskId = 0;
            using (var conn = Database.GetConnection())
            {
                taskId = conn.QuerySingle<int>("SELECT TOP 1 Id FROM GameTask WHERE GameId = @Id", game2);
            }
            var controller = GetController(studioId: _existingStudio.Id);

            AsyncTestDelegate action = async () =>
            {
                var result = await controller.AssignTaskAsync(game1.GetGlobalId(), taskId);
            };

            Assert.ThrowsAsync<MismatchedIdsException>(action);
        }

        [Test]
        public void AssignTaskAsync_MisMatchedGameAndUser_ReturnsError()
        {
            // user and studio must match, or they have hacked the cookie encryption and it's all over
            //  use a game from a different studio
            var studio = Database.Studios.Add("another studio");
            var game = Database.Games.Add(studio.Id, GameStatus.Idea, "Whatever");
            var taskId = 0;
            using (var conn = Database.GetConnection())
            {
                taskId = conn.QuerySingle<int>("SELECT TOP 1 Id FROM GameTask WHERE GameId = @Id", game);
            }
            var controller = GetController(studioId: _existingStudio.Id, userId: _user.Id);

            AsyncTestDelegate action = async () =>
            {
                var result = await controller.AssignTaskAsync(game.GetGlobalId(), taskId);
            };

            Assert.ThrowsAsync<AccessDeniedException>(action);
        }

        [Test]
        public async Task UpdateTaskStateAsync_OpenTask_MarksTaskAsComplete()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "Whatever");
            var taskId = 0;
            using (var conn = Database.GetConnection())
            {
                taskId = conn.QuerySingle<int>("SELECT TOP 1 Id FROM GameTask WHERE GameId = @Id", game);
            }
            var controller = GetController(studioId: _existingStudio.Id);

            var result = await controller.UpdateTaskStateAsync(game.GetGlobalId(), taskId, new UpdateTaskStateRequestModel()
            { 
                 TaskState = TaskState.ClosedComplete
            });

            result.Should().BeOfType<OkResult>();
            using (var conn = Database.GetConnection())
            {
                var dbState = conn.QuerySingle<TaskDTO>("SELECT *, TaskState = TaskStateId FROM GameTask WHERE Id = @id", new { Id = taskId });
                dbState.TaskState.Should().Be(TaskState.ClosedComplete);
                dbState.ClosedBy.Should().Be(_user.Id);
                dbState.ClosedOn.Should().NotBeNull();
            }
        }

        [Test]
        public async Task UpdateTaskStateAsync_ReopenTask_MarksTaskAsOpen()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "Whatever");
            Database.Games.CloseTask(game.Id, TaskType.Concept, TaskState.ClosedComplete);
            var taskId = 0;
            using (var conn = Database.GetConnection())
            {
                taskId = conn.QuerySingle<int>("SELECT TOP 1 Id FROM GameTask WHERE GameId = @Id AND TaskTypeId = @TaskTypeId", new { 
                    Id = game.Id,
                    TaskTypeId = TaskType.Concept
                });
            }
            var controller = GetController(studioId: _existingStudio.Id);

            var result = await controller.UpdateTaskStateAsync(game.GetGlobalId(), taskId, new UpdateTaskStateRequestModel()
            {
                TaskState = TaskState.Open
            });

            result.Should().BeOfType<OkResult>();
            using (var conn = Database.GetConnection())
            {
                var dbState = conn.QuerySingle<TaskDTO>("SELECT *, TaskState = TaskStateId FROM GameTask WHERE Id = @id", new { Id = taskId });
                dbState.TaskState.Should().Be(TaskState.Open);
                dbState.ClosedBy.Should().BeNull();
                dbState.ClosedOn.Should().BeNull();
            }
        }

        [Test]
        public void UpdateTaskStateAsync_MismatchedGameAndTask_ReturnsError()
        {
            var game1 = Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "Whatever");
            var game2 = Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "Whatever");
            Database.Games.CloseTask(game1.Id, TaskType.Concept, TaskState.ClosedComplete);
            var taskId = 0;
            using (var conn = Database.GetConnection())
            {
                taskId = conn.QuerySingle<int>("SELECT TOP 1 Id FROM GameTask WHERE GameId = @Id AND TaskTypeId = @TaskTypeId", new
                {
                    Id = game1.Id,
                    TaskTypeId = TaskType.Concept
                });
            }
            var controller = GetController(studioId: _existingStudio.Id);

            AsyncTestDelegate action = async () => await controller.UpdateTaskStateAsync(game2.GetGlobalId(), taskId, new UpdateTaskStateRequestModel()
            {
                TaskState = TaskState.Open
            });

            Assert.ThrowsAsync<MismatchedIdsException>(action);
        }

        [Test]
        public void UpdateTaskStateAsync_MismatchedGameAndUser_ReturnsError()
        {
            // user and studio must match, or they have hacked the cookie encryption and it's all over
            //  use a game from a different studio
            var studio = Database.Studios.Add("another studio");
            var game = Database.Games.Add(studio.Id, GameStatus.Idea, "Whatever");
            Database.Games.CloseTask(game.Id, TaskType.Concept, TaskState.ClosedComplete);
            var taskId = 0;
            using (var conn = Database.GetConnection())
            {
                taskId = conn.QuerySingle<int>("SELECT TOP 1 Id FROM GameTask WHERE GameId = @Id AND TaskTypeId = @TaskTypeId", new
                {
                    Id = game.Id,
                    TaskTypeId = TaskType.Concept
                });
            }
            var controller = GetController(studioId: _existingStudio.Id);

            AsyncTestDelegate action = async () => await controller.UpdateTaskStateAsync(game.GetGlobalId(), taskId, new UpdateTaskStateRequestModel()
            {
                TaskState = TaskState.Open
            });

            Assert.ThrowsAsync<AccessDeniedException>(action);
        }
    }
}
