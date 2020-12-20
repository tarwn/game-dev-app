using GDB.Common.Authentication;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Persistence.Repositories
{
    public interface IPasswordResetTokenRepository
    {
        Task AddTokenAsync(int userId, string newToken, DateTime createdOn, DateTime goodThrough);
        Task<PasswordResetToken> GetAsync(int userId, string resetToken);
        Task UpdateTokenAsUsedAsync(int userId, string resetToken, DateTime usedOn);
    }
}
