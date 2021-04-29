using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    public class SignalRSender : ISignalRSender
    {
        private IHubContext<SignalRHub> _hubContext;

        public SignalRSender(IHubContext<SignalRHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendAsync(UserAuthContext user, UpdateScope scope, string gameId, object change)
        {
            var hubgroup = GetSignalRGroupName(user, scope, gameId);
            await _hubContext.Clients.Group(hubgroup).SendAsync(hubgroup, change);
        }

        public async Task SendAsync(UserAuthContext user, UpdateScope scope, object change)
        {
            var hubgroup = GetSignalRGroupName(user, scope);
            await _hubContext.Clients.Group(hubgroup).SendAsync(hubgroup, change);
        }

        public static string GetSignalRGroupName(UserAuthContext auth, UpdateScope scope, string id = "")
        {
            switch (scope)
            {
                case UpdateScope.CurrentUserRecord:
                    return $"user/{auth.UserId}";
                case UpdateScope.StudioRecord:
                case UpdateScope.StudioGameList:
                case UpdateScope.StudioUserList:
                    return $"{auth.StudioId}/{scope}";
                case UpdateScope.GameBusinessModel:
                case UpdateScope.GameCashforecast:
                case UpdateScope.GameTasks:
                    return $"{auth.StudioId}/{id}/{scope}";
                default:
                    throw new Exception("Unexpected update type provided to SignalR registration");
            }
        }
    }

    public interface ISignalRSender { 
    
        Task SendAsync(UserAuthContext user, UpdateScope scope, string gameId, object change);
        Task SendAsync(UserAuthContext user, UpdateScope scope, object change);
    }
}
