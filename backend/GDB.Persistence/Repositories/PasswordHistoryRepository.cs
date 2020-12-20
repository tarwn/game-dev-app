using Dapper;
using GDB.Common.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Persistence.Repositories
{
    public class PasswordHistoryRepository : BaseRepository, IPasswordHistoryRepository
    {
        public PasswordHistoryRepository(string connectionString) : base(connectionString)
        { }

        public async Task CreateAsync(int userId, string passwordHash, DateTime createdOn)
        {
            var param = new { userId, passwordHash, createdOn };
            var sql = @"
                INSERT INTO dbo.PasswordHistory(UserId, PasswordHash, CreatedOn)
                VALUES(@UserId, @PasswordHash, @CreatedOn);
            ";
            using (var conn = GetConnection())
            {
                await conn.ExecuteAsync(sql, param);
            }
        }

    }
}
