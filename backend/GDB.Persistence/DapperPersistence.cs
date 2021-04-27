using Dapper;
using GDB.Common.Persistence;
using GDB.Common.Persistence.Repositories;
using GDB.Persistence.Conversions;
using GDB.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Text;

namespace GDB.Persistence
{
    public class DapperPersistence : IPersistence
    {
        private DatabaseConnectionSettings _settings;

        public DapperPersistence(DatabaseConnectionSettings settings)
        {
            _settings = settings;

            PatchDapper();

            Actors = new ActorRepository(_settings.Database);
            CashForecastSnapshots = new CashForecastSnapshotRepository(_settings.Database);
            Customers = new CustomerRepository(_settings.Database);
            EventStore = new EventStoreRepository(_settings.Database);
            Games = new GameRepository(_settings.Database);
            Tasks = new TasksRepository(_settings.Database);
            Studios = new StudioRepository(_settings.Database);
            Users = new UserRepository(_settings.Database);
            UserSessions = new UserSessionRepository(_settings.Database);
            PasswordHistory = new PasswordHistoryRepository(_settings.Database);
            PasswordResetTokens = new PasswordResetTokenRepository(_settings.Database);
        }

        public IActorRepository Actors { get; }
        public ICashForecastSnapshotRepository CashForecastSnapshots { get; }
        public ICustomerRepository Customers { get; }
        public IEventStoreRepository EventStore { get; }
        public IGameRepository Games { get; }
        public ITasksRepository Tasks { get; }
        public IStudioRepository Studios { get; }
        public IUserRepository Users { get; }
        public IUserSessionRepository UserSessions { get; }
        public IPasswordResetTokenRepository PasswordResetTokens { get; }
        public IPasswordHistoryRepository PasswordHistory { get; }

        public static void PatchDapper()
        {
            SqlMapper.AddTypeHandler(new DateTimeHandler());
        }

    }
}
