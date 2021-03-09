using Dapper;
using GDB.Common.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Persistence.Repositories
{
    public class CashForecastSnapshotRepository : BaseRepository, ICashForecastSnapshotRepository
    {
        public CashForecastSnapshotRepository(string connectionString) : base(connectionString)
        { }

        public async Task CreateAsync(int studioId, int gameId, int versionNumber, DateTime forecastDate, DateTime advanceTime)
        {
            var param = new { studioId, gameId, versionNumber, forecastDate, advanceTime };
            var sql = @"
                INSERT INTO dbo.CashForecastSnapshot(StudioId, GameId, ForecastDate, LastVersionNumber, ChangeDate)
                VALUES(@StudioId, @GameId, @ForecastDate, @VersionNumber, @AdvanceTime);
            ";
            using (var conn = GetConnection())
            {
                await conn.ExecuteAsync(sql, param);
            }
        }
    }
}
