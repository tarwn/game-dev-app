using GDB.Common.Authorization;
using GDB.Common.BusinessLogic;
using GDB.Common.Context;
using GDB.Common.DTOs.Studio;
using GDB.Common.DTOs.User;
using GDB.Common.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic.Settings
{
    public class UserService : IUserService
    {
        private IBusinessServiceOperator _busOp;

        public UserService(IBusinessServiceOperator busOp)
        {
            _busOp = busOp;
        }

        public async Task UpdateAsync(int userId, UserUpdateDTO update, IAuthContext authContext)
        {
            await _busOp.Operation(async (p) => {
                if (userId != authContext.UserId && authContext.Role != StudioUserRole.Administrator)
                { 
                    throw new AuthorizationDeniedException("Only administrators can edit other users", $"Authorization error: {authContext.UserId} attempted to UpdateAsync another user and is currently Role {authContext.Role}");
                }

                var user = await p.Users.GetByIdAsync(userId);
                if (update.HasSeenPopup.HasValue)
                {
                    user.HasSeenPopup = update.HasSeenPopup.Value;
                }
                else
                {
                    // no update(s) to apply
                    return;
                }

                await p.Users.UpdateUserAsync(user, DateTime.UtcNow, authContext.UserId);
            });
        }

    }
}
