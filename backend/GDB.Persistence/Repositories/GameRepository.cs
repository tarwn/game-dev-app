using Dapper;
using GDB.Common.DTOs.Game;
using GDB.Common.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Persistence.Repositories
{

    public class GameRepository : BaseRepository, IGameRepository
    {
        public GameRepository(string connectionString) : base(connectionString)
        { }

        public async Task<List<GameDTO>> GetAllAsync(int studioId)
        {
            var param = new { studioId };
            var sql = @"
                SELECT Id, 
                        StudioId,
                        [Name],
                        Status = GameStatusId,
                        LaunchDate,
                        LogoUrl,
                        CreatedOn,
                        CreatedBy,
                        UpdatedOn,
                        UpdatedBy
                FROM dbo.Game
                WHERE StudioId = @StudioId;
            ";
            using (var conn = GetConnection())
            {
                return (await conn.QueryAsync<GameDTO>(sql, param))
                    .ToList();
            }
        }
    }
}