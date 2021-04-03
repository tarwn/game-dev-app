using Microsoft.AspNetCore.SignalR;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    public class SignalRSender : ISignalRSender
    {
        public const string GamesListSummary = "gamesList";
        public const string LoggedInStudio = "studio";
        public const string LoggedInUser = "userProfile";
        public const string SpecificGame = "game";
        public const string SpecificBusinessModel = "businessModel";
        public const string SpecificCashForecast = "cashForecast";
        private IHubContext<SignalRHub> _hubContext;

        public SignalRSender(IHubContext<SignalRHub> hubContext)
        {
            _hubContext = hubContext;
        }

        public async Task SendAsync(UserAuthContext user, UpdateScope scope, string gameId, object change)
        {
            var hubgroup = GetSignalRGroupName(user, UpdateScope.GameCashforecast, gameId);
            await _hubContext.Clients.Group(hubgroup).SendAsync(hubgroup, change);
        }

        public async Task SendAsync(UserAuthContext user, UpdateScope scope, object change)
        {
            var hubgroup = GetSignalRGroupName(user, scope);
            await _hubContext.Clients.Group(hubgroup).SendAsync(hubgroup, change);
        }

        public string GetSignalRGroupName(UserAuthContext auth, UpdateScope scope, string id = "")
        {
            switch (scope)
            {
                case UpdateScope.CurrentUserRecord:
                    return $"user/{auth.UserId}";
                case UpdateScope.StudioRecord:
                case UpdateScope.StudioGameList:
                    return $"{auth.StudioId}/{scope}";
                case UpdateScope.GameBusinessModel:
                case UpdateScope.GameCashforecast:
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
