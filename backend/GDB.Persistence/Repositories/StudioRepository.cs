using Dapper;
using GDB.Common.Authentication;
using GDB.Common.DTOs.Customer;
using GDB.Common.DTOs.Studio;
using GDB.Common.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Data.SqlClient;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Persistence.Repositories
{
    public class StudioRepository : BaseRepository, IStudioRepository
    {
        public StudioRepository(string connectionString) : base(connectionString)
        { }

        public async Task<List<AccessibleStudio>> GetAccessibleStudiosByUserAsync(int userId)
        {
            var param = new { userId };
            var sql = @"
                SELECT S.Id,
                       S.[Name]
                FROM dbo.Studio S
                    INNER JOIN dbo.UserStudioXref USX ON USX.StudioId = S.Id
                WHERE USX.UserId = @UserId;
            ";
            using (var conn = GetConnection())
            {
                return (await conn.QueryAsync<AccessibleStudio>(sql, param))
                        .ToList();
            }
        }

        public async Task<StudioDTO> GetByIdAsync(int studioId)
        {
            var param = new { studioId };
            var sql = @"
                SELECT S.Id,
                       S.[Name]
                FROM dbo.Studio S
                WHERE S.Id = @StudioId;
            ";
            using (var conn = GetConnection())
            {
                return await conn.QuerySingleOrDefaultAsync<StudioDTO>(sql, param);
            }
        }

        public async Task<bool> IsAccessibleByUserAsync(int userId, int studioId)
        {
            var param = new { userId, studioId };
            var sql = @"
                SELECT HasAccess
                FROM dbo.UserStudioXref USX
                WHERE USX.UserId = @UserId
                    AND USX.StudioId = @StudioId;
            ";
            using (var conn = GetConnection())
            {
                // default is false, which works in our favor
                return await conn.QuerySingleOrDefaultAsync<bool>(sql, param);
            }
        }

    }
}
