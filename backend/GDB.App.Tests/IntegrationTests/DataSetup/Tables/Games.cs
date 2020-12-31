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

        public GameDTO Add(int studioId, GameStatus status, string name, string logoUrl = null, DateTime? launchDate = null)
        {
            using (var conn = _databaseHelper.GetConnection())
            {
                var sql = @"
                    INSERT INTO dbo.Game(StudioId, [Name], GameStatusId, LaunchDate, LogoUrl, CreatedOn, CreatedBy, UpdatedOn, UpdatedBy)
                    VALUES(@StudioId, @Name, @Status, @LaunchDate, @LogoUrl, @CreatedOn, @CreatedBy, @UpdatedOn, @UpdatedBy);
                    SELECT *, Status = GameStatusId FROM Game WHERE Id = scope_identity();
                ";
                var param = new
                {
                    studioId,
                    status,
                    name,
                    logoUrl,
                    launchDate,
                    createdBy = -1,
                    createdOn = DateTime.UtcNow,
                    updatedBy = -1,
                    updatedOn = DateTime.UtcNow
                };
                return conn.QuerySingle<GameDTO>(sql, param);
            }
        }
    }
}
