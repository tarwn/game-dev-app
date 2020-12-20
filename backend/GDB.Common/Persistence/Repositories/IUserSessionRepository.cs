using GDB.Common.Authentication;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Persistence.Repositories
{
    public interface IUserSessionRepository
    {
        Task<UserSession> CreateSessionAsync(int userId, int studioId, DateTime createdOn, DateTime validUntil);
    }
}
