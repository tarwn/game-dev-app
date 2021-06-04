using Dapper;
using GDB.Common.DTOs.Game;
using GDB.Common.DTOs.Task;
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
                                        CashForecastLastUpdatedOn, CashForecastLastUpdatedBy, GoalsDocUrl, GoalsNotes, GroundworkDocUrl, GroundworkNotes)
                    VALUES(@StudioId, @Name, @Status, @LaunchDate, @IsFavorite, @LogoUrl, @CreatedOn, @CreatedBy, @UpdatedOn, @UpdatedBy, @DeletedOn, @DeletedBy,
                                        @CashForecastLastUpdatedOn, @CashForecastLastUpdatedBy, @GoalsDocUrl, @GoalsNotes, @GroundworkDocUrl, @GroundworkNotes);
                    
                    DECLARE @GameId int = scope_identity();

                    INSERT INTO dbo.GameTask(TaskTypeId, GameId, TaskStateId, DueDate, CreatedOn, CreatedBy)
                    SELECT TT.Id, @GameId, 1 /* Open */, NULL, GetUtcDate(), -1
                    FROM dbo.TaskType TT
                    WHERE TT.Id <= 10;  -- standard tasks

                    SELECT *, Status = GameStatusId FROM Game WHERE Id = @GameId;
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
                    CashForecastLastUpdatedBy = hasCashForecast ? -1 : (int?) null,
                    GoalsDocUrl = "",
                    GoalsNotes = "",
                    GroundworkDocUrl = "",
                    GroundworkNotes = ""
                };
                return conn.QuerySingle<GameDTO>(sql, param);
            }
        }

        public void CloseTask(int id, TaskType taskType, TaskState state = TaskState.ClosedComplete)
        {
            var param = new { 
                id, 
                taskType, 
                state, 
                ClosedOn = state != TaskState.Open ? DateTime.UtcNow : (DateTime?)null,
                ClosedBy = state != TaskState.Open ? -1 : (int?)null,
                UpdatedOn = DateTime.UtcNow,
                UpdatedBy = -1
            };
            var sql = @"
                UPDATE dbo.GameTask 
                SET TaskStateId = @state,
                    ClosedOn = @ClosedOn,
                    ClosedBy = @ClosedBy,
                    UpdatedOn = @UpdatedOn,
                    UpdatedBy = @UpdatedBy
                WHERE GameId = @id
                    AND TaskTypeId = @TaskType;
            ";
            using (var conn = _databaseHelper.GetConnection())
            {
                conn.Execute(sql, param);
            }
        }
    }
}
