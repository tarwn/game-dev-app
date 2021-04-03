using Dapper;
using GDB.Common.DTOs.Game;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.App.Tests.IntegrationTests.DataSetup.Tables
{
    public class Games
    {
        private DatabaseHelper _databaseHelper;

        public Games(DatabaseHelper databaseHelper)
        {
            _databaseHelper = databaseHelper;
        }

        public GameDTO Add(int studioId, GameStatus status, string name, string logoUrl = null, DateTime? launchDate = null, bool isFavorite = true, bool isDeleted = false,
            bool hasCashForecast = false)
        {
            using (var conn = _databaseHelper.GetConnection())
            {
                var sql = @"
                    INSERT INTO dbo.Game(StudioId, [Name], GameStatusId, LaunchDate, IsFavorite, LogoUrl, CreatedOn, CreatedBy, UpdatedOn, UpdatedBy, DeletedOn, DeletedBy,
                                        CashForecastLastUpdatedOn, CashForecastLastUpdatedBy)
                    VALUES(@StudioId, @Name, @Status, @LaunchDate, @IsFavorite, @LogoUrl, @CreatedOn, @CreatedBy, @UpdatedOn, @UpdatedBy, @DeletedOn, @DeletedBy,
                                        @CashForecastLastUpdatedOn, @CashForecastLastUpdatedBy);
                    SELECT *, Status = GameStatusId FROM Game WHERE Id = scope_identity();
                ";
                var param = new
                {
                    studioId,
                    status,
                    name,
                    logoUrl,
                    launchDate,
                    isFavorite,
                    createdBy = -1,
                    createdOn = DateTime.UtcNow,
                    updatedBy = -1,
                    updatedOn = DateTime.UtcNow,
                    deletedOn = isDeleted ? DateTime.UtcNow : (DateTime?) null,
                    deletedBy = isDeleted ? -1 : (int?)null,
                    CashForecastLastUpdatedOn = hasCashForecast ? DateTime.UtcNow : (DateTime?) null,
                    CashForecastLastUpdatedBy = hasCashForecast ? -1 : (int?) null
                };
                return conn.QuerySingle<GameDTO>(sql, param);
            }
        }
    }
}
