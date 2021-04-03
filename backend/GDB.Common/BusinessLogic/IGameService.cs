using GDB.Common.Context;
using GDB.Common.DTOs.Game;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.BusinessLogic
{
    public interface IGameService
    {
        Task<GameDTO> CreateGameAsync(IAuthContext authContext);
        Task UpdateGameAsync(int id, UpdateGameDTO updateDto, IAuthContext authContext);
        Task DeleteGameAsync(int id, IAuthContext authContext);
    }
}
