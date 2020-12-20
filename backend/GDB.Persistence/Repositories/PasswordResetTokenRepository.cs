using Dapper;
using GDB.Common.Authentication;
using GDB.Common.DTOs.Customer;
using GDB.Common.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Persistence.Repositories
{
    public class PasswordResetTokenRepository : BaseRepository, IPasswordResetTokenRepository
    {
        public PasswordResetTokenRepository(string connectionString) : base(connectionString)
        { }

        public async Task AddTokenAsync(int userId, string newToken, DateTime createdOn, DateTime goodThrough)
        {
            var param = new { userId, newToken, createdOn, goodThrough };
            var sql = @"
                INSERT INTO dbo.PasswordResetToken(TargetUserId, ResetToken, CreatedOn, GoodThrough)
                VALUES(@UserId, @NewToken, @CreatedOn, @GoodThrough);
            ";
            using (var conn = GetConnection())
            {
                await conn.ExecuteAsync(sql, param);
            }
        }

        public async Task<PasswordResetToken> GetAsync(int userId, string resetToken)
        {
            var param = new { userId, resetToken };
            var sql = @"
                SELECT Id,
                        TargetUserId, 
                        ResetToken, 
                        CreatedOn, 
                        GoodThrough,
                        UsedOn
                FROM dbo.PasswordResetToken
                WHERE ResetToken = @ResetToken
                    AND TargetUserId = @UserId;
            ";
            using (var conn = GetConnection())
            {
                return await conn.QuerySingleOrDefaultAsync<PasswordResetToken>(sql, param);
            }
        }

        public async Task UpdateTokenAsUsedAsync(int userId, string resetToken, DateTime usedOn)
        {
            var param = new { userId, resetToken, usedOn };
            var sql = @"
                UPDATE dbo.PasswordResetToken
                SET UsedOn = @UsedOn
                WHERE TargetUserId = @UserId
                    AND ResetToken = @ResetToken;
            ";
            using (var conn = GetConnection())
            {
                await conn.ExecuteAsync(sql, param);
            }
        }
    }
}
