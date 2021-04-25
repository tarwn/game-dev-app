using GDB.Business.BusinessLogic;
using GDB.Business.Tests.Utilities;
using GDB.Common.Authorization;
using GDB.Common.DTOs.Studio;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.Tests.BusinessLogic
{
    [TestFixture]
    public class ActorServiceTests
    {
        private ActorService _service;
        private MockPersistence _persistenceMock;

        public const int FakeUserId = 3;

        [SetUp]
        public void Setup()
        {
            _persistenceMock = new MockPersistence();
            var busop = new BusinessServiceOperatorWithRetry(_persistenceMock);
            var logger = new Mock<ILogger<ActorService>>();
            _service = new ActorService(busop, _persistenceMock, logger.Object);
        }

        [Test]
        public async Task GetLatestSeqNoAsync_ValidUser_ReturnsLatestSeqNo()
        {
            var actorId = "test123";
            _persistenceMock.ActorsMock.Setup(a => a.GetActorAsync(actorId))
                  .ReturnsAsync(new ActorRegistration(actorId, 123, FakeUserId, DateTime.UtcNow));
            var auth = new TestAuthContext(FakeUserId, 1, StudioUserRole.Administrator);

            var result = await _service.GetLatestSeqNoAsync(actorId, auth);

            Assert.AreEqual(123, result);
        }

        [Test]
        public void GetLatestSeqNoAsync_DifferentUser_ThrowsError()
        {
            var actorId = "test123";
            _persistenceMock.ActorsMock.Setup(a => a.GetActorAsync(actorId))
                  .ReturnsAsync(new ActorRegistration(actorId, 123, FakeUserId + 5, DateTime.UtcNow));
            var auth = new TestAuthContext(FakeUserId, 1, StudioUserRole.Administrator);

            Assert.ThrowsAsync<AccessDeniedException>(async() => 
                await _service.GetLatestSeqNoAsync(actorId, auth)
            );
        }


        [Test]
        public async Task GetActorAsync_ValidUser_GeneratesAndRegistersActorId()
        {
            var actorId = "";
            _persistenceMock.ActorsMock.Setup(a => a.RegisterActorAsync(It.IsAny<string>(), 30, FakeUserId, It.IsAny<DateTime>()))
                  .Callback<string, int, int, DateTime>((s, _, __, ___) => { actorId = s; })
                  .Returns<string, int, int, DateTime>((s, _, __, ___) => Task.FromResult(new ActorRegistration(s, 123, FakeUserId + 5, DateTime.UtcNow.AddYears(-1))));
            var auth = new TestAuthContext(FakeUserId, 1, StudioUserRole.Administrator);

            var actor = await _service.GetActorAsync(auth);

            Assert.AreEqual(actorId, actor);
            _persistenceMock.ActorsMock.Verify(a => a.RegisterActorAsync(actorId, 30, FakeUserId, It.IsAny<DateTime>()), Times.Once());
        }

        [Test]
        public async Task GetActorAsync_ValidUserSeveralActorsInUse_GeneratesAndRegistersActorId()
        {
            var actorIds = new List<string>();
            _persistenceMock.ActorsMock.Setup(a => a.RegisterActorAsync(It.IsAny<string>(), 30, FakeUserId, It.IsAny<DateTime>()))
                  .Callback<string, int, int, DateTime>((s, _, __, ___) => { actorIds.Add(s); })
                  .Returns<string, int, int, DateTime>((s, _, __, ___) => Task.FromResult(actorIds.Count < 2 ? null : new ActorRegistration(s, 123, FakeUserId + 5, DateTime.UtcNow.AddYears(-1))));
            var auth = new TestAuthContext(FakeUserId, 1, StudioUserRole.Administrator);

            var actor = await _service.GetActorAsync(auth);

            Assert.AreEqual(actorIds.Count, 2); // skipped first choice one
            Assert.AreEqual(actorIds.Last(), actor);
            _persistenceMock.ActorsMock.Verify(a => a.RegisterActorAsync(actorIds[0], 30, FakeUserId, It.IsAny<DateTime>()), Times.Once());
            _persistenceMock.ActorsMock.Verify(a => a.RegisterActorAsync(actorIds[1], 30, FakeUserId, It.IsAny<DateTime>()), Times.Once());
        }

    }
}
