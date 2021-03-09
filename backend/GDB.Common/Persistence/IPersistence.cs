using GDB.Common.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.Persistence
{
    public interface IPersistence
    {
        ICustomerRepository Customers { get; }

        IStudioRepository Studios { get; }
        IUserRepository Users { get; }
        IUserSessionRepository UserSessions { get; }
        IPasswordHistoryRepository PasswordHistory { get; }
        IPasswordResetTokenRepository PasswordResetTokens { get; }

        IActorRepository Actors { get; }
        IGameRepository Games { get; }
        IEventStoreRepository EventStore { get; }
        ICashForecastSnapshotRepository CashForecastSnapshots { get; }
    }
}
