using FluentAssertions;
using GDB.App.Controllers.Frontend;
using GDB.App.Controllers.Frontend.Models;
using GDB.Business.BusinessLogic;
using GDB.Common.Authentication;
using GDB.Persistence;
using Microsoft.AspNetCore.Mvc;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.App.Tests.IntegrationTests.Controllers.Frontend
{
    [TestFixture]
    public class ActorControllerTests : IntegrationTestsBase
    {
        private ActorController _controller;
        private User _sampleUser;

        [OneTimeSetUp]
        public void OneTimeSetUp()
        {
            Database.ClearDatabase();
            _sampleUser = Database.Users.Add("test", "test", "", false);
        }

        [SetUp]
        public void BeforeEachTest()
        {
            var persistence = new DapperPersistence(Database.GetConnectionSettings());
            var busOps = new BusinessServiceOperatorWithRetry(persistence);
            var service = new ActorService(busOps, persistence);
            _controller = new ActorController(service)
            {
                ControllerContext = GetControllerContextForFrontEnd(userId: _sampleUser.Id)
            };
        }

        [Test]
        public async Task GetLatestSeqNoAsync_ValidActorAndUser_ReturnsLatestSeqNo()
        {
            var user = _sampleUser;
            var actor = Database.Actors.Add("actor-1", user.Id, 123, DateTime.UtcNow);

            var result = await _controller.GetLatestSeqNoAsync(actor.Actor);

            result.Should().BeOfType<OkObjectResult>()
                .Which.Value.Should().BeOfType<LatestSeqNoModel>()
                .Which.SeqNo.Should().Be(123);
        }

        [Test]
        public async Task GetLatestSeqNoAsync_ActorforDifferentUser_ReturnsBadRequest()
        {
            var otherUser = Database.Users.Add("other user", "other user", "", false);
            var actor = Database.Actors.Add("actor-2", otherUser.Id, 123, DateTime.UtcNow);

            var result = await _controller.GetLatestSeqNoAsync(actor.Actor);

            result.Should().BeOfType<BadRequestObjectResult>()
                .Which.Value.Should().BeOfType<BadRequestResponseModel>()
                .Which.ErrorType.Should().Be(BadRequestType.GeneralError);
        }
    }
}
