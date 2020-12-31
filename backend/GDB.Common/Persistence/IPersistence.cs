using GDB.Common.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.Persistence
{
    public interface IPersistence
    {
        ICustomerRepository Customers { get; }

        IStudioRepository Studios { get; set; }
        IUserRepository Users { get; set; }
        IUserSessionRepository UserSessions { get; set; }
        IPasswordHistoryRepository PasswordHistory { get; set; }
        IPasswordResetTokenRepository PasswordResetTokens { get; set; }

        IGameRepository Games{ get; set; }
    }
}
