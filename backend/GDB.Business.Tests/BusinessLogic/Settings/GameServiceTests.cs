using FluentAssertions;
using GDB.Business.BusinessLogic;
using GDB.Business.BusinessLogic.Settings;
using GDB.Business.Tests.Utilities;
using GDB.Common.Context;
using GDB.Common.DTOs.Game;
using GDB.Common.DTOs.Studio;
using Microsoft.Extensions.Logging;
using Moq;
using NUnit.Framework;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.Tests.BusinessLogic.Settings
{
    [TestFixture]
    public class GameServiceTests
    {
        private GameService _service;
        private MockPersistence _persistenceMock;

        public const int FakeStudioId = 3;
        public const int FakeUserId = 4;

        [SetUp]
        public void Setup()
        {
            _persistenceMock = new MockPersistence();
            var busop = new BusinessServiceOperatorWithRetry(_persistenceMock);
            _service = new GameService(busop);
        }

        [Test]
        public async Task CreateGameAsync_ValidArgs_CreatesGameAndInitialTasks()
        {
            var gameId = 123;
            _persistenceMock.GamesMock.Setup(g => g.CreateAsync(It.IsAny<GameDTO>()))
                .ReturnsAsync((GameDTO dto) => { dto.Id = gameId; return dto; });

            var result = await _service.CreateGameAsync(GetAuthContext(studioId: FakeStudioId, userId: FakeUserId));

            result.StudioId.Should().Be(FakeStudioId);
            result.CreatedBy.Should().Be(FakeUserId);
            result.CreatedOn.Should().BeCloseTo(DateTime.UtcNow, 200);
            result.Status.Should().Be(GameStatus.Idea);
            _persistenceMock.GamesMock.Verify(g => g.CreateAsync(It.IsAny<GameDTO>()), Times.Once());
            _persistenceMock.TasksMock.Verify(t => t.CreateInitialTasksAsync(gameId, FakeUserId, It.IsAny<DateTime>()), Times.Once());
        }

        private IAuthContext GetAuthContext(int studioId = FakeStudioId, int userId = FakeUserId)
        {
            return new TestAuthContext(userId, studioId, StudioUserRole.Administrator);
        }
    }
}
