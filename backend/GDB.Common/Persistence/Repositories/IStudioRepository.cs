using GDB.Common.Authentication;
using GDB.Common.DTOs.Studio;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Persistence.Repositories
{
    public interface IStudioRepository
    {
        Task<List<AccessibleStudio>> GetAccessibleStudiosByUserAsync(int userId);
        Task<bool> IsAccessibleByUserAsync(int userId, int studioId);
        Task<StudioDTO> GetByIdAsync(int studioId);
    }
}
