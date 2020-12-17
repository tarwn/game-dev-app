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

        private static ConcurrentDictionary<string, List<string>> _connectionRegistrations = new ConcurrentDictionary<string, List<string>>();

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

        public async Task RegisterForUpdates(string updateTypeId)
        {
            // TODO validate user is allowed to access this game id [ch926] or [ch993]

            _logger.LogInformation($"Client connected to '{updateTypeId}': {Context.ConnectionId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, updateTypeId);
            _connectionRegistrations.AddOrUpdate(Context.ConnectionId, new List<string> { updateTypeId }, (k, list) => {
                list.Add(updateTypeId);
                return list;
            });
        }

        public async Task UnregisterForUpdates(string updateTypeId)
        {
            _logger.LogInformation($"Client leaving '{updateTypeId}': {Context.ConnectionId}");
            await Groups.RemoveFromGroupAsync(Context.ConnectionId, updateTypeId);
            if (_connectionRegistrations.TryGetValue(Context.ConnectionId, out var list)) {
                var newList = list.Select(s => s).ToList();
                newList.RemoveAll(s => s.Equals(updateTypeId));
                _connectionRegistrations.TryUpdate(Context.ConnectionId, newList, list);
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
