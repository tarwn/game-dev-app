using GDB.Common.Authentication;
using GDB.Common.Context;
using GDB.Common.DTOs.Customer;
using GDB.Common.DTOs.Game;
using GDB.Common.DTOs.Studio;
using GDB.Common.DTOs.Task;
using GDB.Common.DTOs.User;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.BusinessLogic
{
    public interface IInteractiveUserQueryService
    {
        Task<List<CustomerDTO>> GetAllCustomersAsync();
        Task<StudioDTO> GetStudioAsync(int studioId, IAuthContext userAuth);
        Task<UserDTO> GetUserAsync(int userId, IAuthContext userAuth);
        Task<List<GameDTO>> GetAllGamesAsync(IAuthContext userAuth);
        Task<GameDTO> GetGameAsync(int id, IAuthContext userAuth);
        Task<List<StudioUserDTO>> GetStudioUsersAsync(int studioId, IAuthContext userAuth);
        Task<List<TaskDTO>> GetOpenTasksAsync(int gameId, IAuthContext userAuth);
        Task<List<TaskDTO>> GetAllTasksAsync(int gameId, IAuthContext userAuth);
    }
}
