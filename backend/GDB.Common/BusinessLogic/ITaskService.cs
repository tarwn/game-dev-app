using GDB.Common.Context;
using GDB.Common.DTOs.Task;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.BusinessLogic
{
    public interface ITaskService
    {
        Task AssignTaskToUserAsync(int gameId, int taskId, IAuthContext authUser);
        Task UpdateTaskStateAsync(int gameId, int taskId, TaskState taskState, IAuthContext authUser);
    }
}
