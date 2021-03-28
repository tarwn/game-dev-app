using Dapper;
using GDB.Common.Authentication;
using GDB.Common.DTOs.Customer;
using GDB.Common.DTOs.User;
using GDB.Common.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Persistence.Repositories
{
    public class UserRepository : BaseRepository, IUserRepository
    {
        public UserRepository(string connectionString) : base(connectionString)
        { }

        public async Task<UserWithCreds> GetAuthWithCredentialsByUsernameAsync(string username)
        {
            var param = new { username };
            var sql = @"
                SELECT Id,
                        UserName,
                        DisplayName,
                        MustResetpassword,
                        PasswordHash
                FROM dbo.[User]
                WHERE UserName = @UserName;
            ";
            using (var conn = GetConnection())
            {
                return await conn.QuerySingleOrDefaultAsync<UserWithCreds>(sql, param);
            }
        }

        public async Task<User> GetAuthByUsernameAsync(string username)
        {
            var param = new { username };
            var sql = @"
                SELECT Id,
                        UserName,
                        DisplayName,
                        MustResetpassword
                FROM dbo.[User]
                WHERE UserName = @UserName;
            ";
            using (var conn = GetConnection())
            {
                return await conn.QuerySingleOrDefaultAsync<User>(sql, param);
            }
        }

        public async Task<User> GetAuthByIdAsync(int userId)
        {
            var param = new { userId };
            var sql = @"
                SELECT Id,
                        UserName,
                        DisplayName,
                        MustResetpassword
                FROM dbo.[User]
                WHERE Id = @UserId;
            ";
            using (var conn = GetConnection())
            {
                return await conn.QuerySingleOrDefaultAsync<User>(sql, param);
            }
        }

        public async Task UpdatePasswordAsync(int userId, string passwordHash, DateTime updatedOn, int updatedBy)
        {
            var param = new { userId, passwordHash, updatedOn, updatedBy };
            var sql = @"
                UPDATE dbo.[User]
                SET PasswordHash = @PasswordHash,
                    UpdatedBy = @UpdatedBy,
                    UpdatedOn = @UpdatedOn,
                    MustResetPassword = 'false'
                WHERE Id = @UserId;
            ";
            using (var conn = GetConnection())
            {
                await conn.ExecuteAsync(sql, param);
            }
        }

        public async Task<UserDTO> GetByIdAsync(int userId)
        {
            var param = new { userId };
            var sql = @"
                SELECT Id,
                        UserName,
                        DisplayName
                FROM dbo.[User]
                WHERE Id = @UserId;
            ";
            using (var conn = GetConnection())
            {
                return await conn.QuerySingleOrDefaultAsync<UserDTO>(sql, param);
            }
        }
    }
}
