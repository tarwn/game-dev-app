using GDB.Common.Authorization;
using GDB.Common.Context;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Business.BusinessLogic
{
    public static class IdHelper
    {
        public static int CheckAndExtractGameId(string gameId, IAuthContext authContext)
        {
            if (!gameId.StartsWith($"{authContext.StudioId}:"))
            {
                throw new AccessDeniedException("Specified game does not exist or is not accessible by this studio", $"Access Denied: User {authContext.UserId} attempted to access game {gameId} while logged in for studio {authContext.StudioId}");
            }

            if (!int.TryParse(gameId.Split(":")[1], out var actualGameId))
            {
                throw new AccessDeniedException("Specified game does not exist or is not accessible by this studio", $"Invalid Game Id: User {authContext.UserId} attempted to access game {gameId} while logged in for studio {authContext.StudioId}");
            }

            return actualGameId;
        }
    }
}
