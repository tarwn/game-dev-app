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
    }
}
