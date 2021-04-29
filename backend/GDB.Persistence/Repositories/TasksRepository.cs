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

        public async Task AssignTaskToUserAsync(int gameId, int taskId, int userId)
        {
            var param = new { gameId, taskId, userId };
            var sql = @"
                UPDATE dbo.GameTaskAssignment WITH (UPDLOCK, SERIALIZABLE) 
                SET GameTaskId = @taskId
                WHERE UserId = @UserId
                    AND GameId = @GameId;
 
                IF @@ROWCOUNT = 0
                BEGIN
                    INSERT INTO dbo.GameTaskAssignment(UserId, GameId, GameTaskId)
                    VALUES(@UserId, @GameId, @TaskId);
                END
            ";
            using (var conn = GetConnection())
            {
                await conn.ExecuteAsync(sql, param);
            }
        }

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

        public async Task<TaskDTO> GetAsync(int taskId)
        {
            var param = new { taskId };
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
                WHERE GT.Id = @TaskId;
            ";
            using (var conn = GetConnection())
            {
                return await conn.QuerySingleOrDefaultAsync<TaskDTO>(sql, param);
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

        public async Task UpdateAsync(TaskDTO task)
        {
            var sql = @"
                UPDATE dbo.GameTask
                SET TaskStateId = @TaskState,
                    DueDate = @DueDate,
                    UpdatedOn = @UpdatedOn,
                    UpdatedBy = @UpdatedBy,
                    ClosedOn = @ClosedOn,
                    ClosedBy = @ClosedBy
                WHERE Id = @Id;
            ";
            using (var conn = GetConnection())
            {
                await conn.ExecuteAsync(sql, task);
            }
        }
    }
}
