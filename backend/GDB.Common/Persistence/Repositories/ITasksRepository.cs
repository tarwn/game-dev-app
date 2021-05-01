using GDB.Common.DTOs.Task;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Persistence.Repositories
{
    public interface ITasksRepository
    {
        Task<List<TaskDTO>> GetOpenTasksAsync(int gameId);
        Task<List<TaskDTO>> GetAllTasksAsync(int gameId);
        Task AssignTaskToUserAsync(int gameId, int taskId, int userId);
        Task<TaskDTO> GetAsync(int taskId);
        Task UpdateAsync(TaskDTO task);
        Task<TaskDTO> GetAssignedTaskAsync(int gameId, int userId);
    }
}
