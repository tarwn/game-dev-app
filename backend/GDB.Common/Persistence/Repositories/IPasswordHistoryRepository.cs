using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Persistence.Repositories
{
    public interface IPasswordHistoryRepository
    {
        Task CreateAsync(int userId, string passwordHash, DateTime createdOn);
    }
}
