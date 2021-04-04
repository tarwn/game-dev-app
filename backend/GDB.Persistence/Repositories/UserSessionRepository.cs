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
    public class UserSessionRepository : BaseRepository, IUserSessionRepository
    {
        public UserSessionRepository(string connectionString) : base(connectionString)
        { }

        public async Task<UserSession> CreateSessionAsync(int userId, int studioId, DateTime createdOn, DateTime validUntil)
        {
            var param = new { userId, studioId, createdOn, validUntil };
            var sql = @"
                INSERT INTO dbo.UserSession(UserId, StudioId, CreatedOn, LastSeenOn, AbsoluteExpirationDate, IsForcedExpiration)
                VALUES(@UserId, @StudioId, @CreatedOn, @CreatedOn, @ValidUntil, 'false');

                SELECT US.Id, US.UserId, US.StudioId, X.Role AS StudioUserRole
                FROM dbo.UserSession US
                    INNER JOIN dbo.UserStudioXref X ON X.UserId = US.UserId AND X.StudioId = US.StudioId
                WHERE Id = scope_identity();
            ";
            using (var conn = GetConnection())
            {
                return await conn.QuerySingleAsync<UserSession>(sql, param);
            }
        }
    }
}
