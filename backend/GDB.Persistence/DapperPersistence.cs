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

            Customers = new CustomerRepository(_settings.Database);
            Games = new GameRepository(_settings.Database);
            Studios = new StudioRepository(_settings.Database);
            Users = new UserRepository(_settings.Database);
            UserSessions = new UserSessionRepository(_settings.Database);
            PasswordHistory = new PasswordHistoryRepository(_settings.Database);
            PasswordResetTokens = new PasswordResetTokenRepository(_settings.Database);
        }

        public ICustomerRepository Customers { get; }
        public IGameRepository Games{ get; set; }
        public IStudioRepository Studios { get; set; }
        public IUserRepository Users { get; set; }
        public IUserSessionRepository UserSessions { get; set; }
        public IPasswordResetTokenRepository PasswordResetTokens { get; set; }
        public IPasswordHistoryRepository PasswordHistory { get; set; }

        public static void PatchDapper()
        {
            SqlMapper.AddTypeHandler(new DateTimeHandler());
        }

    }
}
