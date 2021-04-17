using GDB.Common.Context;
using GDB.Common.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.BusinessLogic
{
    public interface IUserService
    {
        Task UpdateAsync(int userId, UserUpdateDTO update, IAuthContext authContext);
    }
}
