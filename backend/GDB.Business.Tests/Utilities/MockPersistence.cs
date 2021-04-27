using GDB.Common.Persistence;
using GDB.Common.Persistence.Repositories;
using Moq;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Business.Tests.Utilities
{
    public class MockPersistence : IPersistence
    {

        public MockPersistence()
        {
            ActorsMock = new Mock<IActorRepository>();
            CashForecastSnapshotsMock = new Mock<ICashForecastSnapshotRepository>();
            CustomersMock = new Mock<ICustomerRepository>();
            StudiosMock = new Mock<IStudioRepository>();
            UsersMock = new Mock<IUserRepository>();
            UserSessionsMock = new Mock<IUserSessionRepository>();
            PasswordHistoryMock = new Mock<IPasswordHistoryRepository>();
            PasswordResetTokensMock = new Mock<IPasswordResetTokenRepository>();
            GamesMock = new Mock<IGameRepository>();
            TasksMock = new Mock<ITasksRepository>();
            EventStoreMock = new Mock<IEventStoreRepository>();
        }

        public Mock<IActorRepository> ActorsMock { get; }
        public IActorRepository Actors { get { return ActorsMock.Object; } }
        public Mock<ICashForecastSnapshotRepository> CashForecastSnapshotsMock { get; }
        public ICashForecastSnapshotRepository CashForecastSnapshots { get { return CashForecastSnapshotsMock.Object; } }
        public Mock<ICustomerRepository> CustomersMock { get; }
        public ICustomerRepository Customers { get { return CustomersMock.Object; } }
        public Mock<IStudioRepository> StudiosMock { get; }
        public IStudioRepository Studios { get { return StudiosMock.Object; } }
        public Mock<IUserRepository> UsersMock { get; }
        public IUserRepository Users { get { return UsersMock.Object; } }
        public Mock<IUserSessionRepository> UserSessionsMock { get; }
        public IUserSessionRepository UserSessions { get { return UserSessionsMock.Object; } }
        public Mock<IPasswordHistoryRepository> PasswordHistoryMock { get; }
        public IPasswordHistoryRepository PasswordHistory { get { return PasswordHistoryMock.Object; } }
        public Mock<IPasswordResetTokenRepository> PasswordResetTokensMock { get; }
        public IPasswordResetTokenRepository PasswordResetTokens { get { return PasswordResetTokensMock.Object; } }
        public Mock<IGameRepository> GamesMock { get; }
        public IGameRepository Games { get { return GamesMock.Object; } }
        public Mock<ITasksRepository> TasksMock { get; }
        public ITasksRepository Tasks { get { return TasksMock.Object; } }
        public Mock<IEventStoreRepository> EventStoreMock { get; }
        public IEventStoreRepository EventStore { get { return EventStoreMock.Object; } }
    }
}
