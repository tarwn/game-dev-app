using GDB.Common.DTOs.Game;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Persistence.Repositories
{
    public interface IGameRepository
    {
        Task<List<GameDTO>> GetAllAsync(int studioId);
    }
}
