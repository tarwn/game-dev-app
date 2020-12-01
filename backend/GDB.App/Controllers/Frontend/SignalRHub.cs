using GDB.App.Security;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.SignalR;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Concurrent;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class SignalRHub : Hub<ISignalRHub>
    {
        private static ConcurrentDictionary<string, string> _connectionGroupAssignments = new ConcurrentDictionary<string, string>();
        private ILogger<SignalRHub> _logger;

        public SignalRHub(ILogger<SignalRHub> logger)
        {
            _logger = logger;
        }

        public async Task JoinGroup(string gameId)
        {
            // TODO validate user is allowed to access this game id [ch926] or [ch993]

            _logger.LogInformation($"Client connected to '{gameId}': {Context.ConnectionId}");
            if (_connectionGroupAssignments.TryGetValue(Context.ConnectionId, out var oldGroup))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, oldGroup);
            }
            _connectionGroupAssignments.AddOrUpdate(Context.ConnectionId, gameId, (key, old) => gameId);
            await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        }

        public async Task LeaveGroups()
        {
            _logger.LogInformation($"Client leaving groups': {Context.ConnectionId}");
            if (_connectionGroupAssignments.TryGetValue(Context.ConnectionId, out var oldGroup))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, oldGroup);
            }
        }


        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _logger.LogInformation($"Client disconnected': {Context.ConnectionId}");
            if (_connectionGroupAssignments.TryGetValue(Context.ConnectionId, out var oldGroup))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, oldGroup);
            }
        }
    }

    public interface ISignalRHub
    {
        Task JoinGroup(string gameId);
    }
}
