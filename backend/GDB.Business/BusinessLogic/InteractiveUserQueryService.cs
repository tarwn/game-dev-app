using GDB.Common.Authentication;
using GDB.Common.Authorization;
using GDB.Common.BusinessLogic;
using GDB.Common.Context;
using GDB.Common.DTOs.Customer;
using GDB.Common.DTOs.Game;
using GDB.Common.DTOs.Studio;
using GDB.Common.DTOs.User;
using GDB.Common.Persistence;
using System;
using System.Collections.Generic;
using System.Runtime.InteropServices.ComTypes;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic
{
    public class InteractiveUserQueryService : IInteractiveUserQueryService
    {
        private IBusinessServiceOperator _busOp;

        public InteractiveUserQueryService(IBusinessServiceOperator busOp)
        {
            _busOp = busOp;
        }

        public async Task<List<CustomerDTO>> GetAllCustomersAsync()
        {
            return await _busOp.Query(async (persistence) =>
            {
                return await persistence.Customers.GetAllAsync();
            });
        }

        public async Task<List<GameDTO>> GetAllGamesAsync(IAuthContext userAuth)
        {
            return await _busOp.Query(async (persistence) =>
            {
                return await persistence.Games.GetAllAsync(userAuth.StudioId);
            });
        }

        public async Task<GameDTO> GetGameAsync(int id, IAuthContext userAuth)
        {
            return await _busOp.Query(async (persistence) =>
            {
                return await persistence.Games.GetByIdAsync(userAuth.StudioId, id);
            });
        }

        public async Task<StudioDTO> GetStudioAsync(int studioId, IAuthContext userAuth)
        {
            return await _busOp.Query(async (persistence) =>
            {
                if (studioId != userAuth.StudioId)
                {
                    throw new AccessDeniedException("That studio does not exist or you do not have access", $"User {userAuth.UserId} attempted to access studio {studioId} and is currently authed for studio {userAuth.StudioId}");
                }

                if (!await persistence.Studios.IsAccessibleByUserAsync(userAuth.UserId, studioId))
                {
                    throw new AccessDeniedException("That studio does not exist or you do not have access", $"User {userAuth.UserId} attempted to access studio {studioId} and does not have access");
                }

                return await persistence.Studios.GetByIdAsync(studioId);
            });
        }

        public async Task<UserDTO> GetUserAsync(int userId, IAuthContext userAuth)
        {
            return await _busOp.Query(async (persistence) =>
            {
                // user id must be accessible for same studio as this user is authed for
                if (!await persistence.Studios.IsAccessibleByUserAsync(userId, userAuth.StudioId))
                {
                    throw new AccessDeniedException("That user does not exist or does not have access to this studio", $"User {userAuth.UserId} attempted to access user {userId} which doesn't have access to studio {userAuth.StudioId}");
                }

                return await persistence.Users.GetByIdAsync(userId);
            });
        }
    }
}
