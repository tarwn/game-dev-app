using GDB.App.Security;
using GDB.Common.DTOs.Studio;
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
    public enum UpdateScope
    {
        StudioGameList = 1,
        StudioRecord = 2,
        CurrentUserRecord = 3,
        GameBusinessModel = 4,
        GameCashforecast = 5,
        StudioUserList = 6,
        GameTasks = 7,
        AssignedGameTask = 8
    };

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

        //public async Task JoinGroup(string gameId)
        //{
        //    // TODO validate user is allowed to access this game id [ch926] or [ch993]

        //    _logger.LogInformation($"Client connected to '{gameId}': {Context.ConnectionId}");
        //    if (_connectionGroupAssignments.TryGetValue(Context.ConnectionId, out var oldGroup))
        //    {
        //        await Groups.RemoveFromGroupAsync(Context.ConnectionId, oldGroup);
        //    }
        //    _connectionGroupAssignments.AddOrUpdate(Context.ConnectionId, gameId, (key, old) => gameId);
        //    await Groups.AddToGroupAsync(Context.ConnectionId, gameId);
        //}

        //public async Task LeaveGroups()
        //{
        //    _logger.LogInformation($"Client leaving groups': {Context.ConnectionId}");
        //    if (_connectionGroupAssignments.TryGetValue(Context.ConnectionId, out var oldGroup))
        //    {
        //        await Groups.RemoveFromGroupAsync(Context.ConnectionId, oldGroup);
        //    }
        //}

        public async Task<string> RegisterForUpdates(UpdateScope updateType, string id = "")
        {
            var group = MapToGroup(updateType, id);

            _logger.LogInformation($"Client connected to '{group}': {Context.ConnectionId}");
            await Groups.AddToGroupAsync(Context.ConnectionId, group);
            _connectionRegistrations.AddOrUpdate(Context.ConnectionId, new List<string> { group }, (k, list) =>
            {
                list.Add(group);
                return list;
            });
            return group;
        }

        public async Task UnregisterForUpdates(UpdateScope updateType, string id = "")
        {
            var group = MapToGroup(updateType, id);

            if (_connectionRegistrations.TryGetValue(Context.ConnectionId, out var list))
            {
                // removing only the first list - going to see if we can have multiple registrations
                //  for the same group so that screens can set more than one web socket channel for the same channel for
                //  different behaviors from the same updates
                // but want to be able to disconnect from a granular one withotu disconnected at the layout level
                var count = list.Count(s => s.Equals(group));
                _logger.LogInformation($"Client unregistered '{group}': {Context.ConnectionId} - {count} registrations");
                if (count == 1)
                {
                    _logger.LogInformation($"Client leaving '{group}': {Context.ConnectionId}");
                    await Groups.RemoveFromGroupAsync(Context.ConnectionId, group);
                }

                var firstMatch = list.Where(s => s.Equals(group)).FirstOrDefault();
                if (firstMatch != null)
                {
                    var newList = list.Select(s => s).ToList();
                    newList.Remove(firstMatch);
                    _connectionRegistrations.TryUpdate(Context.ConnectionId, newList, list);
                }
            }
        }

        private string MapToGroup(UpdateScope updateType, string id)
        {
            var auth = GetUserAuthContext();
            return SignalRSender.GetSignalRGroupName(auth, updateType, id);
        }

        public override async Task OnDisconnectedAsync(Exception exception)
        {
            _logger.LogInformation($"Client disconnected': {Context.ConnectionId}");
            if (_connectionGroupAssignments.TryGetValue(Context.ConnectionId, out var oldGroup))
            {
                await Groups.RemoveFromGroupAsync(Context.ConnectionId, oldGroup);
            }
        }

        private UserAuthContext GetUserAuthContext()
        {
            var userId = int.Parse(Context.User.FindFirst(ClaimNames.UserId).Value);
            var username = Context.User.FindFirst(ClaimNames.UserName).Value;
            var sessionId = int.Parse(Context.User.FindFirst(ClaimNames.SessionId).Value);
            var studioId = int.Parse(Context.User.FindFirst(ClaimNames.StudioId).Value);
            var role = (StudioUserRole)int.Parse(Context.User.FindFirst(ClaimNames.StudioRole).Value);

            return new UserAuthContext(sessionId, userId, username, studioId, role);
        }
    }

    public interface ISignalRHub
    {
        Task<string> RegisterForUpdates(UpdateScope updateType);
        Task UnregisterForUpdates(UpdateScope updateType);
    }
}
