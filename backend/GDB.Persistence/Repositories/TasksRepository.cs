using Dapper;
using GDB.Common.DTOs.Task;
using GDB.Common.Persistence.Repositories;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Persistence.Repositories
{
    public class TasksRepository : BaseRepository, ITasksRepository
    {
        public TasksRepository(string connectionString) : base(connectionString)
        { }

        public async Task<List<TaskDTO>> GetAllTasksAsync(int gameId)
        {
            var param = new { gameId };
            var sql = @"
                SELECT GT.Id,
                    TaskType = GT.TaskTypeId,
                    GT.GameId,
                    TaskState = GT.TaskStateId,
                    GT.DueDate,
                    GT.CreatedOn,
                    GT.CreatedBy,
                    GT.UpdatedOn,
                    GT.UpdatedBy,
                    GT.ClosedOn,
                    GT.ClosedBy
                FROM dbo.GameTask GT
                WHERE GT.GameId = @GameId;
            ";
            using (var conn = GetConnection())
            {
                return (await conn.QueryAsync<TaskDTO>(sql, param)).ToList();
            }
        }

        public async Task<List<TaskDTO>> GetOpenTasksAsync(int gameId)
        {
            var param = new { gameId };
            var sql = @"
                DECLARE @OpenTask int = 1;

                SELECT GT.Id,
                    TaskType = GT.TaskTypeId,
                    GT.GameId,
                    TaskState = GT.TaskStateId,
                    GT.DueDate,
                    GT.CreatedOn,
                    GT.CreatedBy,
                    GT.UpdatedOn,
                    GT.UpdatedBy,
                    GT.ClosedOn,
                    GT.ClosedBy
                FROM dbo.GameTask GT
                    INNER JOIN dbo.Game G ON G.Id = GT.GameId
                    INNER JOIN dbo.TaskType  TT ON TT.Id = GT.TaskTypeId
                WHERE GT.TaskStateId = @OpenTask
                    AND G.Id = @GameId
                    AND G.GameStatusId = TT.GameStatusId;
            ";
            using (var conn = GetConnection())
            {
                return (await conn.QueryAsync<TaskDTO>(sql, param)).ToList();
            }
        }
    }
}
