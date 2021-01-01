using GDB.Business.BusinessLogic;
using GDB.Business.Tests.Utilities;
using GDB.Common.Authorization;
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
            _service = new ActorService(busop, _persistenceMock);
        }

        [Test]
        public async Task GetLatestSeqNoAsync_ValidUser_ReturnsLatestSeqNo()
        {
            var actorId = "test123";
            _persistenceMock.ActorsMock.Setup(a => a.GetActorAsync(actorId))
                  .ReturnsAsync(new ActorRegistration(actorId, 123, FakeUserId, DateTime.UtcNow));
            var auth = new TestAuthContext(FakeUserId, 1);

            var result = await _service.GetLatestSeqNoAsync(actorId, auth);

            Assert.AreEqual(123, result);
        }

        [Test]
        public void GetLatestSeqNoAsync_DifferentUser_ThrowsError()
        {
            var actorId = "test123";
            _persistenceMock.ActorsMock.Setup(a => a.GetActorAsync(actorId))
                  .ReturnsAsync(new ActorRegistration(actorId, 123, FakeUserId + 5, DateTime.UtcNow));
            var auth = new TestAuthContext(FakeUserId, 1);

            Assert.ThrowsAsync<AccessDeniedException>(async() => 
                await _service.GetLatestSeqNoAsync(actorId, auth)
            );
        }


        [Test]
        public async Task GetActorAsync_ValidUser_GeneratesAndRegistersActorId()
        {
            var actorId = "";
            _persistenceMock.ActorsMock.Setup(a => a.GetActorAsync(It.IsAny<string>()))
                  .Callback<string>(s => { actorId = s; })
                  .Returns<string>(s => Task.FromResult(new ActorRegistration(s, 123, FakeUserId + 5, DateTime.UtcNow.AddYears(-1))));
            var auth = new TestAuthContext(FakeUserId, 1);

            var actor = await _service.GetActorAsync(auth);

            Assert.AreEqual(actorId, actor);
            _persistenceMock.ActorsMock.Verify(a => a.UpdateActorAsync(actorId, 123, FakeUserId, It.IsAny<DateTime>()), Times.Once());
        }

        [Test]
        public async Task GetActorAsync_ValidUserSeveralActorsInUse_GeneratesAndRegistersActorId()
        {
            var actorIds = new List<string>();
            _persistenceMock.ActorsMock.Setup(a => a.GetActorAsync(It.IsAny<string>()))
                  .Callback<string>(s => { actorIds.Add(s); })
                  .Returns<string>(s => Task.FromResult(new ActorRegistration(s, 123, FakeUserId + 5, actorIds.Count >= 2 ? DateTime.UtcNow.AddYears(-1) : DateTime.UtcNow.AddDays(-1))));
            var auth = new TestAuthContext(FakeUserId, 1);

            var actor = await _service.GetActorAsync(auth);

            Assert.AreEqual(actorIds.Count, 2); // skipped first choice one
            Assert.AreEqual(actorIds.Last(), actor);
            _persistenceMock.ActorsMock.Verify(a => a.UpdateActorAsync(actorIds[0], 123, FakeUserId, It.IsAny<DateTime>()), Times.Never());
            _persistenceMock.ActorsMock.Verify(a => a.UpdateActorAsync(actorIds[1], 123, FakeUserId, It.IsAny<DateTime>()), Times.Once());
        }

    }
}
