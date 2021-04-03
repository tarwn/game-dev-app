using GDB.Common.Authentication;
using GDB.Common.DTOs.Studio;
using GDB.Common.DTOs.User;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Persistence.Repositories
{
    public interface IUserRepository
    {
        Task<UserWithCreds> GetAuthWithCredentialsByUsernameAsync(string username);
        Task<User> GetAuthByUsernameAsync(string username);
        Task<User> GetAuthByIdAsync(int userId);
        Task UpdatePasswordAsync(int userId, string passwordHash, DateTime updatedOn, int updatedBy);

        Task<UserDTO> GetByIdAsync(int userId);
        Task<List<StudioUserDTO>> GetByStudioIdAsync(int studioId);
    }
}
