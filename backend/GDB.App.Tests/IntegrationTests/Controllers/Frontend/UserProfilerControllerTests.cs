using Dapper;
using FluentAssertions;
using GDB.App.Controllers.Frontend;
using GDB.App.Controllers.Frontend.Models.UserProfile;
using GDB.Business.BusinessLogic;
using GDB.Business.BusinessLogic.Settings;
using GDB.Common.DTOs.Studio;
using GDB.Common.DTOs.User;
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
    public class UserProfilerControllerTests : IntegrationTestsBase
    {

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            Database.ClearDatabase();
        }

        public UserProfileController GetController(int userId, int studioId)
        {
            var persistence = new DapperPersistence(Database.GetConnectionSettings());
            var busOps = new BusinessServiceOperatorWithRetry(persistence);
            var queryService = new InteractiveUserQueryService(busOps);
            var userService = new UserService(busOps);
            var signalrService = new Mock<ISignalRSender>().Object;
            return new UserProfileController(queryService, userService, signalrService)
            {
                ControllerContext = GetControllerContextForFrontEnd(userId: userId, studioId: studioId)
            };
        }

        [Test]
        public async Task GetUserProfileAsync_NoArgs_ReturnsUserProfileForLoggedInUser()
        {
            var studio = Database.Studios.Add("studio");
            var user = Database.Users.Add("unit test", "unit test", "unit test", false);
            Database.Studios.AssignUserAccesstoStudio(user.Id, studio.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator);

            var controller = GetController(user.Id, studio.Id);
            var result = await controller.GetUserProfileAsync();

            var resultData = AssertResponseIs<OkObjectResult, UserProfileModel>(result);
            resultData.Id.Should().Be(user.Id);
            resultData.DisplayName.Should().Be(user.DisplayName);
            resultData.HasSeenPopup.Should().Be(0);
        }

        [Test]
        public async Task UpdateUserProfileAsync_UpdatedhasSeenPopup_AppliesUpdateToDB()
        {
            var studio = Database.Studios.Add("studio");
            var user = Database.Users.Add("unit test", "unit test 1", "unit test", false);
            Database.Studios.AssignUserAccesstoStudio(user.Id, studio.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator);

            var controller = GetController(user.Id, studio.Id);
            var result = await controller.UpdateUserProfileAsync(new UpdateUserProfileRequestModel()
            {
                Id = user.Id,
                HasSeenPopup = AutomaticPopup.GameDashboard | AutomaticPopup.BusinessModel
            });

            result.Should().BeOfType<OkResult>();
            using (var conn = Database.GetConnection())
            {
                var userDb = await conn.QueryAsync<UserDTO>("SELECT * FROM [User] WHERE Id = @Id", user);
                userDb.Should().HaveCount(1);
                userDb.First().HasSeenPopup.Should().HaveFlag(AutomaticPopup.GameDashboard);
                userDb.First().HasSeenPopup.Should().HaveFlag(AutomaticPopup.BusinessModel);
            }
        }


        [Test]
        public async Task UpdateUserProfileAsync_MismatchId_ReturnsBadRequest()
        {
            var studio = Database.Studios.Add("studio");
            var user = Database.Users.Add("unit test", "unit test 2", "unit test", false);
            Database.Studios.AssignUserAccesstoStudio(user.Id, studio.Id, true, StudioUserAccess.Active, StudioUserRole.Administrator);

            var controller = GetController(user.Id, studio.Id);
            var result = await controller.UpdateUserProfileAsync(new UpdateUserProfileRequestModel()
            {
                //Id = -100,
                HasSeenPopup = AutomaticPopup.GameDashboard | AutomaticPopup.BusinessModel
            });

            result.Should().BeOfType<BadRequestObjectResult>();
        }
    }
}
