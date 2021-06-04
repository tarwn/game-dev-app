using Dapper;
using FluentAssertions;
using GDB.App.Controllers.Frontend;
using GDB.App.Controllers.Frontend.Models.Games;
using GDB.Business.BusinessLogic;
using GDB.Business.BusinessLogic.Settings;
using GDB.Common.Authentication;
using GDB.Common.Authorization;
using GDB.Common.DTOs.Game;
using GDB.Common.DTOs.Studio;
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
    public class GamesControllerTests : IntegrationTestsBase
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
            //_users[StudioUserRole.Administrator] = _user;
        }

        public GamesController GetController(int? userId = null, int? studioId = null, StudioUserRole? role = null)
        {
            var persistence = new DapperPersistence(Database.GetConnectionSettings());
            var busOps = new BusinessServiceOperatorWithRetry(persistence);
            var queryService = new InteractiveUserQueryService(busOps);
            var gamesService = new GameService(busOps);
            var signalrService = new Mock<ISignalRSender>().Object;
            return new GamesController(queryService, gamesService, signalrService, null)
            {
                ControllerContext = GetControllerContextForFrontEnd(userId: userId ?? _user.Id, studioId: studioId ?? _existingStudio.Id, role: role ?? StudioUserRole.Administrator)
            };
        }

        //public User CreateAndAssignUserForExistingStudio(StudioUserRole role)
        //{
        //    if (!_users.ContainsKey(role))
        //    {
        //        var user = Database.Users.Add(role.ToString() + " user", "ut-" + role.ToString(), "unit test", false);
        //        Database.Studios.AssignUserAccesstoStudio(user.Id, _existingStudio.Id, true, StudioUserAccess.Active, role);
        //        _users.Add(role, user);
        //    }
        //    return _users[role];
        //}

        [Test]
        public async Task GetGamesSummariesAsync_NoParams_ReturnsAllGames()
        {
            var studio = Database.Studios.Add("A Studio");
            var games = new List<GameDTO>(){
                Database.Games.Add(studio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc)),
                Database.Games.Add(studio.Id, GameStatus.Idea, "name2", "logo url2", new DateTime(2022, 1, 2, 0, 0, 0, DateTimeKind.Utc)),
                Database.Games.Add(studio.Id, GameStatus.Developing, "name3", "logo url3", new DateTime(2022, 1, 3, 0, 0, 0, DateTimeKind.Utc))
            };
            var controller = GetController(studioId: studio.Id);

            var result = await controller.GetGamesSummariesAsync();

            var resultList = AssertResponseIs<OkObjectResult, List<GameSummaryModel>>(result);
            resultList.OrderBy(g => g.GlobalId)
                .Should().HaveCountGreaterOrEqualTo(3)
                .And.BeEquivalentTo(games.Select(g => new GameSummaryModel(g)).ToList());
        }

        [Test]
        public async Task GetGamesAsync_NoParams_ReturnsAllGames()
        {
            var studio = Database.Studios.Add("A Studio");
            var games = new List<GameDTO>(){
                Database.Games.Add(studio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc)),
                Database.Games.Add(studio.Id, GameStatus.Idea, "name2", "logo url2", new DateTime(2022, 1, 2, 0, 0, 0, DateTimeKind.Utc)),
                Database.Games.Add(studio.Id, GameStatus.Developing, "name3", "logo url3", new DateTime(2022, 1, 3, 0, 0, 0, DateTimeKind.Utc))
            };
            var controller = GetController(studioId: studio.Id);

            var result = await controller.GetGamesAsync();

            var resultList = AssertResponseIs<OkObjectResult, List<GameExpSummaryModel>>(result);
            resultList.OrderBy(g => g.GlobalId)
                .Should().HaveCountGreaterOrEqualTo(3)
                .And.BeEquivalentTo(games.Select(g => new GameSummaryModel(g)).ToList());
        }

        [Test]
        public async Task GetGamesAsync_NoParams_DoesNotReturnGamesFromOtherStudios()
        {
            var studio2 = Database.Studios.Add("A Different Studio");
            var games = new List<GameDTO>(){
                Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc)),
                Database.Games.Add(_existingStudio.Id, GameStatus.Idea, "name2", "logo url2", new DateTime(2022, 1, 2, 0, 0, 0, DateTimeKind.Utc)),
                Database.Games.Add(_existingStudio.Id, GameStatus.Developing, "name3", "logo url3", new DateTime(2022, 1, 3, 0, 0, 0, DateTimeKind.Utc))
            };
            var controller = GetController(studioId: studio2.Id);

            var result = await controller.GetGamesAsync();

            var resultList = AssertResponseIs<OkObjectResult, List<GameExpSummaryModel>>(result);
            resultList.OrderBy(g => g.GlobalId)
                .Should().HaveCount(0);
        }

        [Test]
        public async Task GetGamesAsync_NoParams_DoesNotReturnDeletedGames()
        {
            var studio = Database.Studios.Add("A Studio");
            var games = new List<GameDTO>(){
                Database.Games.Add(studio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc)),
                Database.Games.Add(studio.Id, GameStatus.Idea, "name2", "logo url2", new DateTime(2022, 1, 2, 0, 0, 0, DateTimeKind.Utc)),
                Database.Games.Add(studio.Id, GameStatus.Developing, "name3", "logo url3", new DateTime(2022, 1, 3, 0, 0, 0, DateTimeKind.Utc), isDeleted: true)
            };
            var controller = GetController(studioId: studio.Id);

            var result = await controller.GetGamesAsync();

            var resultList = AssertResponseIs<OkObjectResult, List<GameExpSummaryModel>>(result);
            resultList.OrderBy(g => g.GlobalId)
                .Should().HaveCount(2);
        }

        [Test]
        public async Task CreateGamesAsync_NoParams_CreatesANewGame()
        {
            var controller = GetController();

            var result = await controller.CreateGameAsync();

            var resultList = AssertResponseIs<OkObjectResult, GameDTO>(result);
            resultList.CreatedBy.Should().Be(_user.Id);
            resultList.StudioId.Should().Be(_existingStudio.Id);
            resultList.Name.Should().NotBeNullOrEmpty();
            resultList.LaunchDate.Should().BeAfter(DateTime.UtcNow);
            resultList.LaunchDate.Day.Should().Be(1);  // 1st of month
            resultList.BusinessModelLastUpdatedOn.Should().BeNull();
            resultList.CashForecastLastUpdatedOn.Should().BeNull();
            resultList.ComparablesLastUpdatedOn.Should().BeNull();
            resultList.MarketingPlanLastUpdatedOn.Should().BeNull();
        }


        [Test]
        public void CreateGamesAsync_NotAnAdmin_FailsWithError()
        {
            // user was a diff role when they logged in + we use role from then
            var controller = GetController(role: StudioUserRole.User);

            AsyncTestDelegate apiCall = async () =>
                await controller.CreateGameAsync();

            Assert.ThrowsAsync<AuthorizationDeniedException>(apiCall);
        }

        [Test]
        public void UpdateGamesAsync_GameUserDoesNotHaveAccessTo_ReturnsError()
        {
            var studio = Database.Studios.Add("A Studio");
            var game = Database.Games.Add(studio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                isFavorite: false);
            var controller = GetController();

            AsyncTestDelegate apiCall = async () =>
                await controller.UpdateGameAsync(game.GetGlobalId(), new UpdateGameRequestModel()
                {
                    IsFavorite = true
                });

            Assert.ThrowsAsync<AccessDeniedException>(apiCall);
        }

        [Test]
        public async Task UpdateGamesAsync_IsFavorite_UpdatesFavoriteFieldOnly()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                isFavorite: false);
            var controller = GetController();

            var result = await controller.UpdateGameAsync(game.GetGlobalId(), new UpdateGameRequestModel()
            {
                IsFavorite = true
            });

            result.Should().BeOfType<OkResult>();
            using (var conn = Database.GetConnection())
            {
                var dto = await conn.QuerySingleAsync<GameDTO>("SELECT *, Status = GameStatusId FROM Game WHERE Id = @Id", game);
                dto.Should().NotBeNull();
                dto.UpdatedBy.Should().Be(_user.Id);
                dto.IsFavorite.Should().Be(true);
                // unchanged
                dto.CreatedBy.Should().Be(-1);
                dto.StudioId.Should().Be(_existingStudio.Id);
                dto.LaunchDate.Should().Be(game.LaunchDate);
                dto.Name.Should().Be(game.Name);
                dto.Status.Should().Be(GameStatus.Live);
                dto.BusinessModelLastUpdatedOn.Should().BeNull();
                dto.CashForecastLastUpdatedOn.Should().BeNull();
                dto.ComparablesLastUpdatedOn.Should().BeNull();
                dto.MarketingPlanLastUpdatedOn.Should().BeNull();
                dto.GoalsDocUrl.Should().Be("");
                dto.GoalsNotes.Should().Be("");
                dto.GroundworkDocUrl.Should().Be("");
                dto.GroundworkNotes.Should().Be("");
            }
        }

        [Test]
        public async Task UpdateGamesAsync_Status_UpdatesStatusFieldOnly()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc), false);
            var controller = GetController();

            var result = await controller.UpdateGameAsync(game.GetGlobalId(), new UpdateGameRequestModel()
            {
                Status = GameStatus.Developing
            });

            result.Should().BeOfType<OkResult>();
            using (var conn = Database.GetConnection())
            {
                var dto = await conn.QuerySingleAsync<GameDTO>("SELECT *, Status = GameStatusId FROM Game WHERE Id = @Id", game);
                dto.Should().NotBeNull();
                dto.UpdatedBy.Should().Be(_user.Id);
                dto.Status.Should().Be(GameStatus.Developing);
                // unchanged
                dto.CreatedBy.Should().Be(-1);
                dto.StudioId.Should().Be(_existingStudio.Id);
                dto.LaunchDate.Should().Be(game.LaunchDate);
                dto.IsFavorite.Should().Be(false);
                dto.Name.Should().Be(game.Name);
                dto.BusinessModelLastUpdatedOn.Should().BeNull();
                dto.CashForecastLastUpdatedOn.Should().BeNull();
                dto.ComparablesLastUpdatedOn.Should().BeNull();
                dto.MarketingPlanLastUpdatedOn.Should().BeNull();
                dto.GoalsDocUrl.Should().Be("");
                dto.GoalsNotes.Should().Be("");
                dto.GroundworkDocUrl.Should().Be("");
                dto.GroundworkNotes.Should().Be("");
            }
        }

        [Test]
        public async Task UpdateGamesAsync_Name_UpdatesNameOnly()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc), false);
            var controller = GetController();

            var result = await controller.UpdateGameAsync(game.GetGlobalId(), new UpdateGameRequestModel()
            {
                Name = "ABC123"
            });

            result.Should().BeOfType<OkResult>();
            using (var conn = Database.GetConnection())
            {
                var dto = await conn.QuerySingleAsync<GameDTO>("SELECT *, Status = GameStatusId FROM Game WHERE Id = @Id", game);
                dto.Should().NotBeNull();
                dto.UpdatedBy.Should().Be(_user.Id);
                dto.Name.Should().Be("ABC123");
                // unchanged
                dto.CreatedBy.Should().Be(-1);
                dto.StudioId.Should().Be(_existingStudio.Id);
                dto.LaunchDate.Should().Be(game.LaunchDate);
                dto.IsFavorite.Should().Be(false);
                dto.Status.Should().Be(GameStatus.Live);
                dto.BusinessModelLastUpdatedOn.Should().BeNull();
                dto.CashForecastLastUpdatedOn.Should().BeNull();
                dto.ComparablesLastUpdatedOn.Should().BeNull();
                dto.MarketingPlanLastUpdatedOn.Should().BeNull();
                dto.GoalsDocUrl.Should().Be("");
                dto.GoalsNotes.Should().Be("");
                dto.GroundworkDocUrl.Should().Be("");
                dto.GroundworkNotes.Should().Be("");
            }
        }

        [Test]
        public async Task UpdateGamesAsync_LaunchDate_UpdatesDateOnly()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc), false);
            var controller = GetController();

            var result = await controller.UpdateGameAsync(game.GetGlobalId(), new UpdateGameRequestModel()
            {
                LaunchDate = new DateTime(2023, 4, 1, 0, 0, 0, DateTimeKind.Utc)
            });

            result.Should().BeOfType<OkResult>();
            using (var conn = Database.GetConnection())
            {
                var dto = await conn.QuerySingleAsync<GameDTO>("SELECT *, Status = GameStatusId FROM Game WHERE Id = @Id", game);
                dto.Should().NotBeNull();
                dto.UpdatedBy.Should().Be(_user.Id);
                dto.LaunchDate.Should().Be(new DateTime(2023, 4, 1, 0, 0, 0, DateTimeKind.Utc));
                // unchanged
                dto.CreatedBy.Should().Be(-1);
                dto.StudioId.Should().Be(_existingStudio.Id);
                dto.Name.Should().Be(game.Name);
                dto.IsFavorite.Should().Be(false);
                dto.Status.Should().Be(GameStatus.Live);
                dto.BusinessModelLastUpdatedOn.Should().BeNull();
                dto.CashForecastLastUpdatedOn.Should().BeNull();
                dto.ComparablesLastUpdatedOn.Should().BeNull();
                dto.MarketingPlanLastUpdatedOn.Should().BeNull();
                dto.GoalsDocUrl.Should().Be("");
                dto.GoalsNotes.Should().Be("");
                dto.GroundworkDocUrl.Should().Be("");
                dto.GroundworkNotes.Should().Be("");
            }
        }

        [Test]
        public async Task UpdateGamesAsync_NoArgs_ReturnsBadRequest()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                isFavorite: false);
            var controller = GetController();

            var result = await controller.UpdateGameAsync(game.GetGlobalId(), new UpdateGameRequestModel()
            {
                // no fields
            });

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Test]
        public void UpdateGamesAsync_NotAnAdmin_FailsWithError()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc));
            // user was a diff role when they logged in + we use role from then
            var controller = GetController(role: StudioUserRole.User);

            AsyncTestDelegate apiCall = async () =>
                await controller.UpdateGameAsync(game.GetGlobalId(), new UpdateGameRequestModel()
                {
                    IsFavorite = true
                });

            Assert.ThrowsAsync<AuthorizationDeniedException>(apiCall);
        }

        [Test]
        public void UpdateGameDetailsAsync_GameUserDoesNotHaveAccessTo_ReturnsError()
        {
            var studio = Database.Studios.Add("A Studio");
            var game = Database.Games.Add(studio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                isFavorite: false);
            var controller = GetController();

            AsyncTestDelegate apiCall = async () =>
                await controller.UpdateGameDetailsAsync(game.GetGlobalId(), new UpdateGameDetailsRequestModel()
                {
                    GoalsDocUrl = "abc"
                });

            Assert.ThrowsAsync<AccessDeniedException>(apiCall);
        }

        [Test]
        public async Task UpdateGameDetailssAsync_NoArgs_ReturnsBadRequest()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc),
                isFavorite: false);
            var controller = GetController();

            var result = await controller.UpdateGameDetailsAsync(game.GetGlobalId(), new UpdateGameDetailsRequestModel()
            {
                // no fields
            });

            result.Should().BeOfType<BadRequestObjectResult>();
        }

        [Test]
        public void UpdateGameDetailsAsync_NotAnAdmin_FailsWithError()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc));
            // user was a diff role when they logged in + we use role from then
            var controller = GetController(role: StudioUserRole.User);

            AsyncTestDelegate apiCall = async () =>
                await controller.UpdateGameDetailsAsync(game.GetGlobalId(), new UpdateGameDetailsRequestModel()
                {
                    GoalsDocUrl = "abc"
                });

            Assert.ThrowsAsync<AuthorizationDeniedException>(apiCall);
        }

        [Test]
        public async Task UpdateGameDetailsAsync_OneField_UpdatesOneFieldOnly()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc), false);
            var controller = GetController();

            var result = await controller.UpdateGameDetailsAsync(game.GetGlobalId(), new UpdateGameDetailsRequestModel()
            {
                GoalsDocUrl = "abc"
            });

            result.Should().BeOfType<OkResult>();
            using (var conn = Database.GetConnection())
            {
                var dto = await conn.QuerySingleAsync<GameDTO>("SELECT *, Status = GameStatusId FROM Game WHERE Id = @Id", game);
                dto.Should().NotBeNull();
                dto.UpdatedBy.Should().Be(_user.Id);
                dto.GoalsDocUrl.Should().Be("abc");
                // unchanged
                dto.CreatedBy.Should().Be(-1);
                dto.StudioId.Should().Be(_existingStudio.Id);
                dto.Name.Should().Be(game.Name);
                dto.IsFavorite.Should().Be(false);
                dto.Status.Should().Be(GameStatus.Live);
                dto.LaunchDate.Should().Be(new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc));
                dto.BusinessModelLastUpdatedOn.Should().BeNull();
                dto.CashForecastLastUpdatedOn.Should().BeNull();
                dto.ComparablesLastUpdatedOn.Should().BeNull();
                dto.MarketingPlanLastUpdatedOn.Should().BeNull();
                dto.GoalsNotes.Should().Be("");
                dto.GroundworkDocUrl.Should().Be("");
                dto.GroundworkNotes.Should().Be("");
            }
        }

        [Test]
        public async Task UpdateGameDetailsAsync_AllDetailsFields_UpdatesDetailFieldsOnly()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc), false);
            var controller = GetController();

            var result = await controller.UpdateGameDetailsAsync(game.GetGlobalId(), new UpdateGameDetailsRequestModel()
            {
                GoalsDocUrl = "abc",
                GoalsNotes = "def",
                GroundworkDocUrl = "ghi",
                GroundworkNotes = "jkl"
            });

            result.Should().BeOfType<OkResult>();
            using (var conn = Database.GetConnection())
            {
                var dto = await conn.QuerySingleAsync<GameDTO>("SELECT *, Status = GameStatusId FROM Game WHERE Id = @Id", game);
                dto.Should().NotBeNull();
                dto.UpdatedBy.Should().Be(_user.Id);
                dto.GoalsDocUrl.Should().Be("abc");
                dto.GoalsNotes.Should().Be("def");
                dto.GroundworkDocUrl.Should().Be("ghi");
                dto.GroundworkNotes.Should().Be("jkl");
                // unchanged
                dto.CreatedBy.Should().Be(-1);
                dto.StudioId.Should().Be(_existingStudio.Id);
                dto.Name.Should().Be(game.Name);
                dto.IsFavorite.Should().Be(false);
                dto.Status.Should().Be(GameStatus.Live);
                dto.LaunchDate.Should().Be(new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc));
                dto.BusinessModelLastUpdatedOn.Should().BeNull();
                dto.CashForecastLastUpdatedOn.Should().BeNull();
                dto.ComparablesLastUpdatedOn.Should().BeNull();
                dto.MarketingPlanLastUpdatedOn.Should().BeNull();
            }
        }



        [Test]
        public async Task DeleteGameAsync_ValidGame_IsDeleted()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc));
            var controller = GetController();

            var result = await controller.DeleteGameAsync(game.GetGlobalId());

            result.Should().BeOfType<OkResult>();
            using (var conn = Database.GetConnection())
            {
                var deletedBy = await conn.QuerySingleAsync<int?>("SELECT DeletedBy FROM Game WHERE Id = @Id", game);
                deletedBy.Should().NotBeNull()
                    .And.Be(_user.Id);
            }
        }

        [Test]
        public void DeleteGameAsync_HasPlanning_ReturnsAnError()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc), hasCashForecast: true);
            var controller = GetController();

            AsyncTestDelegate apiCall = async () =>
                await controller.DeleteGameAsync(game.GetGlobalId());

            Assert.ThrowsAsync<AccessDeniedException>(apiCall);
        }

        [Test]
        public void DeleteGameAsync_WithoutStudioAccess_ReturnsAnError()
        {
            var studio = Database.Studios.Add("A Studio user can't access");
            var game = Database.Games.Add(studio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc));
            var controller = GetController();

            AsyncTestDelegate apiCall = async () =>
                await controller.DeleteGameAsync(game.GetGlobalId());

            Assert.ThrowsAsync<AccessDeniedException>(apiCall);
        }

        [Test]
        public void DeleteGamesAsync_NotAnAdmin_FailsWithError()
        {
            var game = Database.Games.Add(_existingStudio.Id, GameStatus.Live, "name", "logo url", new DateTime(2022, 1, 1, 0, 0, 0, DateTimeKind.Utc), hasCashForecast: true);
            // user was a diff role when they logged in + we use role from then
            var controller = GetController(role: StudioUserRole.User);

            AsyncTestDelegate apiCall = async () =>
                await controller.DeleteGameAsync(game.GetGlobalId());

            Assert.ThrowsAsync<AuthorizationDeniedException>(apiCall);
        }
    }
}
