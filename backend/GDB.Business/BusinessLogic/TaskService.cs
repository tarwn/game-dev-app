using GDB.Common.Authorization;
using GDB.Common.BusinessLogic;
using GDB.Common.Context;
using GDB.Common.DTOs.Task;
using GDB.Common.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic
{
    public class TaskService : ITaskService
    {
        private IBusinessServiceOperator _busOp;
        private IPersistence _persistence;

        public TaskService(IBusinessServiceOperator busOp, IPersistence persistence)
        {
            _busOp = busOp;
            _persistence = persistence;
        }

        public async Task AssignTaskToUserAsync(int gameId, int taskId, IAuthContext authUser)
        {
            await _busOp.Operation(async (p) => {
                var task = await p.Tasks.GetAsync(taskId);
                if (task == null || task.GameId != gameId)
                {
                    throw new MismatchedIdsException("Cannot find that task for the specified game", $"User {authUser.UserId} sent mismatched game id of {gameId} and task id of {taskId}");
                }

                await p.Tasks.AssignTaskToUserAsync(gameId, taskId, authUser.UserId);
            });
        }

        public async Task UnassignTaskToUserAsync(int gameId, int taskId, IAuthContext authUser)
        {
            await _busOp.Operation(async (p) => {
                var task = await p.Tasks.GetAsync(taskId);
                if (task == null || task.GameId != gameId)
                {
                    throw new MismatchedIdsException("Cannot find that task for the specified game", $"User {authUser.UserId} sent mismatched game id of {gameId} and task id of {taskId}");
                }

                await p.Tasks.UnassignTaskToUserAsync(gameId, taskId, authUser.UserId);
            });
        }

        public async Task UpdateTaskStateAsync(int gameId, int taskId, TaskState taskState, IAuthContext authUser)
        {
            await _busOp.Operation(async (p) => {
                var task = await p.Tasks.GetAsync(taskId);
                if (task == null || task.GameId != gameId)
                {
                    throw new MismatchedIdsException("Cannot find that task for the specified game", $"User {authUser.UserId} sent mismatched game id of {gameId} and task id of {taskId}");
                }

                task.TaskState = taskState;
                task.UpdatedBy = authUser.UserId;
                task.UpdatedOn = DateTime.UtcNow;
                if (taskState == TaskState.Open)
                {
                    task.ClosedBy = null;
                    task.ClosedOn = null;
                }
                else
                {
                    task.ClosedBy = authUser.UserId;
                    task.ClosedOn = DateTime.UtcNow;
                }
                await p.Tasks.UpdateAsync(task);
            });
        }
    }
}
