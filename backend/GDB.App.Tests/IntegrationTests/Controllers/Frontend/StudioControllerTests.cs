using Dapper;
using FluentAssertions;
using GDB.App.Controllers.Frontend;
using GDB.App.Controllers.Frontend.Models.Studio;
using GDB.Business.BusinessLogic;
using GDB.Business.BusinessLogic.Settings;
using GDB.Common.Authentication;
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
    public class StudioControllerTests : IntegrationTestsBase
    {

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            Database.ClearDatabase();
            // studio + user for these tests
            //_existingStudio = Database.Studios.Add("GamesControllerTests");
            //_user = Database.Users.Add("GamesControllerTests", "GamesControllerTests", "GamesControllerTests", false);
            //Database.Studios.AssignUserAccesstoStudio(_user.Id, _existingStudio.Id, true);
        }

        public StudioController GetController(int userId, int studioId)
        {
            var persistence = new DapperPersistence(Database.GetConnectionSettings());
            var busOps = new BusinessServiceOperatorWithRetry(persistence);
            var queryService = new InteractiveUserQueryService(busOps);
            var studioService = new StudioService(busOps);
            var signalrService = new Mock<ISignalRSender>().Object;
            return new StudioController(queryService, studioService, signalrService)
            {
                ControllerContext = GetControllerContextForFrontEnd(userId: userId, studioId: studioId)
            };
        }

        [Test]
        public async Task GetStudioAsync_NoArgs_ReturnsStudioForLoggedInUser()
        {
            var studio = Database.Studios.Add("studio");
            var user = Database.Users.Add("unit test", "unit test", "unit test", false);
            Database.Studios.AssignUserAccesstoStudio(user.Id, studio.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator);

            var controller = GetController(user.Id, studio.Id);
            var result = await controller.GetStudioAsync();

            var resultData = AssertResponseIs<OkObjectResult, StudioDTO>(result);
            resultData.Should().BeEquivalentTo(studio);
        }


        [Test]
        public async Task GetStudioUsersAsync_NoArgs_ReturnsAllUsersForLoggedInUsersStudio()
        {
            var studio = Database.Studios.Add("studio");
            var users = new List<User> {
                Database.Users.Add("logged in", "ut-1a", "unit test", false),
                Database.Users.Add("inactive invited", "ut-1b", "unit test", false),
                Database.Users.Add("revoked invited", "ut-1c", "unit test", false),
                Database.Users.Add("active", "ut-1d", "unit test", false),
                Database.Users.Add("revoked", "ut-1e", "unit test", false)
            };
            // logged in user
            Database.Studios.AssignUserAccesstoStudio(users[0].Id, studio.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator);
            // invited inactive user
            Database.Studios.AssignUserAccesstoStudio(users[1].Id, studio.Id, true, StudioUserAccess.PendingActivation, StudioUserRole.User, DateTime.UtcNow.AddDays(1));
            // invited revoked user
            Database.Studios.AssignUserAccesstoStudio(users[2].Id, studio.Id, true, StudioUserAccess.PendingActivation, StudioUserRole.User, null);
            // active user
            Database.Studios.AssignUserAccesstoStudio(users[3].Id, studio.Id, true, StudioUserAccess.Active, StudioUserRole.User);
            // revoked user
            Database.Studios.AssignUserAccesstoStudio(users[4].Id, studio.Id, true, StudioUserAccess.Revoked, StudioUserRole.User);


            var controller = GetController(users[0].Id, studio.Id);
            var result = await controller.GetStudioUsersAsync();

            var resultData = AssertResponseIs<OkObjectResult, List<StudioUserDTO>>(result);
            resultData.Should().HaveCount(5)
                .And.Subject.Select(u => u.Id).Should().BeEquivalentTo(users.Select(u => u.Id));
        }

        [Test]
        public async Task GetStudioUsersAsync_NoArgs_IncludesAllExpectedFieldsOnOutput()
        {
            var studio = Database.Studios.Add("studio");
            var users = new List<User> {
                Database.Users.Add("logged in", "ut-2a", "unit test", false)
            };
            var goodThrough = DateTime.UtcNow.AddDays(12);
            Database.Studios.AssignUserAccesstoStudio(users[0].Id, studio.Id, true, StudioUserAccess.PendingActivation, StudioUserRole.Administrator, goodThrough);

            var controller = GetController(users[0].Id, studio.Id);
            var result = await controller.GetStudioUsersAsync();

            var resultData = AssertResponseIs<OkObjectResult, List<StudioUserDTO>>(result);
            resultData.Should().HaveCount(1);
            var output = resultData.Single();
            output.Id.Should().Be(users[0].Id);
            output.DisplayName.Should().Be(users[0].DisplayName);
            output.UserName.Should().Be(users[0].UserName);
            output.Role.Should().Be(StudioUserRole.Administrator);
            output.Access.Should().Be(StudioUserAccess.PendingActivation);
            output.InvitedBy.Should().NotBeNull();
            output.InvitedOn.Should().NotBeNull();
            output.InviteGoodThrough.Should().BeCloseTo(goodThrough, TimeSpan.FromMilliseconds(100));
        }


        [Test]
        public async Task UpdateStudioAsync_NameUpdate_ReturnsBadRequest()
        {
            var studio = Database.Studios.Add("studio");
            var user = Database.Users.Add("logged in", "ut-3a", "unit test", false);
            Database.Studios.AssignUserAccesstoStudio(user.Id, studio.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator);

            var controller = GetController(user.Id, studio.Id);
            var result = await controller.UpdateStudioAsync(new UpdateStudioRequestModel()
            {
                Name = studio.Name + "abc"
            });

            Assert.IsInstanceOf<OkResult>(result);
            using (var conn = Database.GetConnection())
            {
                var studioAfter = await conn.QuerySingleAsync<StudioDTO>("SELECT * FROM Studio WHERE Id = @Id", studio);
                studioAfter.Name.Should().Be(studio.Name + "abc");
            }
        }

        [Test]
        public async Task UpdateStudioAsync_NoArgs_ReturnsBadRequest()
        {
            var studio = Database.Studios.Add("studio");
            var user = Database.Users.Add("logged in", "ut-4a", "unit test", false);
            Database.Studios.AssignUserAccesstoStudio(user.Id, studio.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator);

            var controller = GetController(user.Id, studio.Id);
            var result = await controller.UpdateStudioAsync(new UpdateStudioRequestModel() { 
                // nothing set
            });

            Assert.IsInstanceOf<BadRequestObjectResult>(result);
        }
    }
}
