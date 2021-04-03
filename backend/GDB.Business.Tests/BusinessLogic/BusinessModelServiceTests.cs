using FluentAssertions;
using GDB.Business.BusinessLogic;
using GDB.Business.BusinessLogic._Generic;
using GDB.Business.BusinessLogic.BusinessModelService;
using GDB.Business.BusinessLogic.EventStore;
using GDB.Business.Tests.Utilities;
using GDB.Common.Authorization;
using GDB.Common.DTOs._Events;
using GDB.Common.DTOs.BusinessModel;
using GDB.Common.DTOs.Game;
using GDB.Common.Persistence;
using Microsoft.Extensions.Caching.Memory;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.Tests.BusinessLogic
{
    [TestFixture]
    public class BusinessModelServiceTests
    {
        private BusinessModelService _businessModelService;
        private MockPersistence _persistenceMock;
        private BusinessModelEventApplier _applier;

        public const int FakeStudioId = 1;
        public const int FakeGameId = 2;
        public const string FakeGameString = "1:2";
        public const int FakeUserId = 3;

        [SetUp]
        public void Setup()
        {
            _persistenceMock = new MockPersistence();
            _applier = new BusinessModelEventApplier();
            var busop = new BusinessServiceOperatorWithRetry(_persistenceMock);
            var cache = new MemoryCache(new MemoryCacheOptions());
            var processor = new EventProcessor<BusinessModelDTO, BusinessModelEventApplier>(_persistenceMock, new ModelEventStore(cache), _applier);
            _businessModelService = new BusinessModelService(busop, processor, _persistenceMock);
        }

        private GameDTO GetSampleGame(int studioId, int gameId)
        {
            return new GameDTO(FakeGameId, FakeStudioId, "sample game", GameStatus.Developing, DateTime.UtcNow, "", true, DateTime.UtcNow, FakeUserId, DateTime.UtcNow, FakeUserId);
        }

        [Test]
        public async Task GetOrCreateAsync_ValidGameIdNoBusinessModel_CreatesAndAppliesInitialEvent()
        {
            _persistenceMock.GamesMock.Setup(g => g.GetByIdAsync(FakeStudioId, FakeGameId))
                .ReturnsAsync(GetSampleGame(FakeStudioId, FakeGameId));
            _persistenceMock.EventStoreMock.Setup(es => es.GetEventsAsync(FakeStudioId, FakeGameId, _applier.ObjectType, It.IsAny<int>()))
                .ReturnsAsync(new List<ChangeEvent>());

            var state = await _businessModelService.GetOrCreateAsync(FakeGameString, new TestAuthContext(FakeUserId, FakeStudioId));

            Assert.IsNotNull(state);
            Assert.AreEqual(1, state.VersionNumber);
            Assert.AreEqual(FakeGameString, state.ParentId);
            _persistenceMock.EventStoreMock.Verify(es =>
                es.CreateEventAsync(FakeStudioId, FakeGameId, _applier.ObjectType,
                                    It.Is<ChangeEvent>(e => e.VersionNumber == 1 && e.PreviousVersionNumber == 0),
                                    It.IsAny<DateTime>()));
            _persistenceMock.GamesMock.Verify(g => g.RegisterBusinessModuleUpdateAsync(FakeStudioId, FakeGameId, FakeUserId, It.IsAny<DateTime>()));
        }

        [Test]
        public async Task GetOrCreateAsync_ValidGameIdExistingBusinessModel_ReturnsBusinessModel()
        {
            _persistenceMock.GamesMock.Setup(g => g.GetByIdAsync(FakeStudioId, FakeGameId))
                .ReturnsAsync(GetSampleGame(FakeStudioId, FakeGameId));
            _persistenceMock.EventStoreMock.Setup(es => es.GetEventsAsync(FakeStudioId, FakeGameId, _applier.ObjectType, 0))
                .ReturnsAsync(new List<ChangeEvent> {
                    _applier.GetCreateEvent(FakeGameString, DateTime.UtcNow)
                });

            var state = await _businessModelService.GetOrCreateAsync(FakeGameString, new TestAuthContext(FakeUserId, FakeStudioId));

            Assert.IsNotNull(state);
            Assert.AreEqual(1, state.VersionNumber);
            Assert.AreEqual(FakeGameString, state.ParentId);
            _persistenceMock.EventStoreMock.Verify(es => es.CreateEventAsync(FakeStudioId, FakeGameId, _applier.ObjectType, 
                                    It.IsAny<ChangeEvent>(),
                                    It.IsAny<DateTime>()),
                Times.Never());
            _persistenceMock.GamesMock.Verify(g => g.RegisterBusinessModuleUpdateAsync(FakeStudioId, FakeGameId, FakeUserId, It.IsAny<DateTime>()),
                Times.Never());
        }

        [Test]
        public void GetOrCreateAsync_NonExistentGame_ThrowsError()
        {
            _persistenceMock.GamesMock.Setup(g => g.GetByIdAsync(FakeStudioId, FakeGameId))
                .ReturnsAsync((GameDTO)null);
            _persistenceMock.EventStoreMock.Setup(es => es.GetEventsAsync(FakeStudioId, FakeGameId, _applier.ObjectType, It.IsAny<int>()))
                .ReturnsAsync(new List<ChangeEvent> { });

            Assert.ThrowsAsync<AccessDeniedException>(async () =>
                await _businessModelService.GetOrCreateAsync(FakeGameString, new TestAuthContext(FakeUserId, FakeStudioId))
            );

            _persistenceMock.EventStoreMock.Verify(es => es.CreateEventAsync(FakeStudioId, FakeGameId, _applier.ObjectType, 
                                    It.IsAny<ChangeEvent>(),
                                    It.IsAny<DateTime>()),
                Times.Never());
        }

        [Test]
        public async Task GetSinceAsync_ValidGameAndVersionWithNoChanges_ReturnsEmptySet()
        {
            _persistenceMock.GamesMock.Setup(g => g.GetByIdAsync(FakeStudioId, FakeGameId))
                .ReturnsAsync(GetSampleGame(FakeStudioId, FakeGameId));
            _persistenceMock.EventStoreMock.Setup(es => es.GetEventsAsync(FakeStudioId, FakeGameId, _applier.ObjectType, 0))
                .ReturnsAsync(new List<ChangeEvent> {
                    _applier.GetCreateEvent(FakeGameString, DateTime.UtcNow)
                });
            _persistenceMock.EventStoreMock.Setup(es => es.GetEventsAsync(FakeStudioId, FakeGameId, _applier.ObjectType, 1))
                .ReturnsAsync(new List<ChangeEvent>());

            var events = await _businessModelService.GetSinceAsync(FakeGameString, 1, new TestAuthContext(FakeUserId, FakeStudioId));

            events.Should().HaveCount(0);
        }

        [Test]
        public async Task GetSinceAsync_ValidGameAndVersionWithChanges_ReturnsEvents()
        {
            _persistenceMock.GamesMock.Setup(g => g.GetByIdAsync(FakeStudioId, FakeGameId))
                .ReturnsAsync(GetSampleGame(FakeStudioId, FakeGameId));
            _persistenceMock.EventStoreMock.Setup(es => es.GetEventsAsync(FakeStudioId, FakeGameId, _applier.ObjectType, 0))
                .ReturnsAsync(new List<ChangeEvent> {
                    _applier.GetCreateEvent(FakeGameString, DateTime.UtcNow)
                });
            _persistenceMock.EventStoreMock.Setup(es => es.GetEventsAsync(FakeStudioId, FakeGameId, _applier.ObjectType, 1))
                .ReturnsAsync(new List<ChangeEvent>(){
                    new ChangeEvent("unit test", 1, "test", 2, 1),
                    new ChangeEvent("unit test", 1, "test", 3, 2),
                });

            var events = await _businessModelService.GetSinceAsync(FakeGameString, 1, new TestAuthContext(FakeUserId, FakeStudioId));

            events.Should().HaveCount(2)
                .And.Contain(e => e.VersionNumber == 2)
                .And.Contain(e => e.VersionNumber == 3);
        }

        [Test]
        public async Task ApplyEventAsync_ValidGameAppliesEvent_ReturnsAppliedEvent()
        {
            _persistenceMock.GamesMock.Setup(g => g.GetByIdAsync(FakeStudioId, FakeGameId))
                .ReturnsAsync(GetSampleGame(FakeStudioId, FakeGameId));
            _persistenceMock.EventStoreMock.Setup(es => es.GetEventsAsync(FakeStudioId, FakeGameId, _applier.ObjectType, 0))
                .ReturnsAsync(new List<ChangeEvent> {
                    _applier.GetCreateEvent(FakeGameString, DateTime.UtcNow)
                });
            var change = GetSampleEvent("abc123");

            var evt = await _businessModelService.ApplyEventAsync(FakeGameString, change, new TestAuthContext(FakeUserId, FakeStudioId));

            evt.VersionNumber.Should().Be(change.PreviousVersionNumber + 1);
            _persistenceMock.EventStoreMock.Verify(es => es.CreateEventAsync(FakeStudioId, FakeGameId, _applier.ObjectType,
                It.Is<ChangeEvent>(e => e.Actor == change.Actor && e.PreviousVersionNumber == change.PreviousVersionNumber && e.Type == change.Type),
                It.IsAny<DateTime>()),
                Times.Once());
            _persistenceMock.GamesMock.Verify(g => g.RegisterBusinessModuleUpdateAsync(FakeStudioId, FakeGameId, FakeUserId, It.IsAny<DateTime>()));
        }


        [Test]
        public async Task ApplyEventAsync_ValidGameAppliesEvent_AdvancesActorSeqNo()
        {
            _persistenceMock.GamesMock.Setup(g => g.GetByIdAsync(FakeStudioId, FakeGameId))
                .ReturnsAsync(GetSampleGame(FakeStudioId, FakeGameId));
            _persistenceMock.EventStoreMock.Setup(es => es.GetEventsAsync(FakeStudioId, FakeGameId, _applier.ObjectType, 0))
                .ReturnsAsync(new List<ChangeEvent> {
                    _applier.GetCreateEvent(FakeGameString, DateTime.UtcNow)
                });
            var change = GetSampleEvent("abc123");

            var evt = await _businessModelService.ApplyEventAsync(FakeGameString, change, new TestAuthContext(FakeUserId, FakeStudioId));

            _persistenceMock.ActorsMock.Verify(a => a.UpdateActorAsync(change.Actor, change.SeqNo + change.Operations.Count, FakeUserId, It.IsAny<DateTime>()));
            _persistenceMock.GamesMock.Verify(g => g.RegisterBusinessModuleUpdateAsync(FakeStudioId, FakeGameId, FakeUserId, It.IsAny<DateTime>()));
        }


        [Test]
        public void ApplyEventAsync_InvalidGame_ThrowsError()
        {
            var change = GetSampleEvent("abc123");

            Assert.ThrowsAsync<AccessDeniedException>(async () =>
                await _businessModelService.ApplyEventAsync("123", change, new TestAuthContext(FakeUserId, FakeStudioId))
            );
        }

        private ChangeEvent GetSampleEvent(string value)
        {
            return new ChangeEvent("unit test", 1, "AddValuePropEntry", default, 1)
            {
                Operations = new List<EventOperation>() {
                     new EventOperation(){ Action = OperationType.Set, Insert = true, ObjectId = "unit-test-1", ParentId="not sure", Value=value }
                }
            };
        }
    }
}
