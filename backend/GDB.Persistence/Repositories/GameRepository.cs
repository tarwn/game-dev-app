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

        public const string AllFields = @"
            Id, 
            StudioId,
            [Name],
            Status = GameStatusId,
            LaunchDate,
            IsFavorite,
            LogoUrl,
            CreatedOn,
            CreatedBy,
            UpdatedOn,
            UpdatedBy,
            BusinessModelLastUpdatedOn,
            BusinessModelLastUpdatedBy,
            CashForecastLastUpdatedOn,
            CashForecastLastUpdatedBy,
            ComparablesLastUpdatedOn,
            ComparablesLastUpdatedBy,
            MarketingPlanLastUpdatedOn,
            MarketingPlanLastUpdatedBy
        ";

        public async Task<GameDTO> CreateAsync(GameDTO game)
        {
            var sql = @"
                INSERT INTO dbo.Game(StudioId, [Name], GameStatusId, LaunchDate, LogoUrl, CreatedOn, CreatedBy, UpdatedBy, UpdatedOn)
                VALUES(@StudioId, @Name, @Status, @LaunchDate, @LogoUrl, @CreatedOn, @CreatedBy, @UpdatedBy, @UpdatedOn);

                SELECT " + AllFields + @"
                FROM dbo.Game
                WHERE Id = SCOPE_IDENTITY();
            ";
            using (var conn = GetConnection())
            {
                return await conn.QuerySingleOrDefaultAsync<GameDTO>(sql, game);
            }
        }

        public async Task DeleteAsync(int id, DateTime deletedOn, int deletedBy)
        {
            var param = new { id, deletedBy, deletedOn };
            var sql = @"
                UPDATE dbo.Game
                SET DeletedBy = @DeletedBy,
                    DeletedOn = @DeletedOn
                WHERE Id = @Id
                    AND DeletedBy IS NULL;
            ";
            using (var conn = GetConnection())
            {
                await conn.ExecuteAsync(sql, param);
            }
        }

        public async Task<List<GameDTO>> GetAllAsync(int studioId)
        {
            var param = new { studioId };
            var sql = @"
                SELECT " + AllFields + @"
                FROM dbo.Game
                WHERE StudioId = @StudioId
                    AND DeletedBy IS NULL;
            ";
            using (var conn = GetConnection())
            {
                return (await conn.QueryAsync<GameDTO>(sql, param))
                    .ToList();
            }
        }

        public async Task<GameDTO> GetByIdAsync(int studioId, int gameId)
        {
            var param = new { studioId, gameId };
            var sql = @"
                SELECT " + AllFields + @"
                FROM dbo.Game
                WHERE StudioId = @StudioId
                    AND Id = @GameId
                    AND DeletedBy IS NULL;
            ";
            using (var conn = GetConnection())
            {
                return await conn.QuerySingleOrDefaultAsync<GameDTO>(sql, param);
            }
        }

        public async Task RegisterBusinessModuleUpdateAsync(int studioId, int gameId, int modifiedBy, DateTime modifiedOn)
        {
            var param = new { studioId, gameId, modifiedBy, modifiedOn };
            var sql = @"
                UPDATE dbo.Game
                SET BusinessModelLastUpdatedOn = @ModifiedOn,
                    BusinessModelLastUpdatedBy = @ModifiedBy
                WHERE StudioId = @StudioId
                    AND Id = @GameId;
            ";
            using (var conn = GetConnection())
            {
                await conn.ExecuteAsync(sql, param);
            }
        }

        public async Task RegisterCashForecastModuleUpdateAsync(int studioId, int gameId, int modifiedBy, DateTime modifiedOn)
        {
            var param = new { studioId, gameId, modifiedBy, modifiedOn };
            var sql = @"
                UPDATE dbo.Game
                SET CashForecastLastUpdatedOn = @ModifiedOn,
                    CashForecastLastUpdatedBy = @ModifiedBy
                WHERE StudioId = @StudioId
                    AND Id = @GameId;
            ";
            using (var conn = GetConnection())
            {
                await conn.ExecuteAsync(sql, param);
            }
        }

        public async Task UpdateAsync(GameDTO game)
        {
            var sql = @"
                UPDATE dbo.Game
                SET IsFavorite = @IsFavorite,
                    [Name] = @Name,
                    GameStatusId = @Status,
                    LaunchDate = @LaunchDate,
                    UpdatedBy = @UpdatedBy,
                    UpdatedOn = @UpdatedOn
                WHERE StudioId = @StudioId
                    AND Id = @Id;
            ";
            using (var conn = GetConnection())
            {
                await conn.ExecuteAsync(sql, game);
            }
        }
    }
}