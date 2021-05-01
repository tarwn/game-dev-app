using GDB.App.Controllers.Frontend.Models.Tasks;
using GDB.App.Security;
using GDB.Business.BusinessLogic;
using GDB.Common.Authorization;
using GDB.Common.BusinessLogic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    [Route("api/fe/gameTasks")]
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class GameTasksController : BaseController
    {
        private IInteractiveUserQueryService _queryService;
        private ITaskService _taskService;
        private ISignalRSender _signalrSender;

        public GameTasksController(IInteractiveUserQueryService queryService, ITaskService taskService, ISignalRSender signalrSender)
        {
            _queryService = queryService;
            _taskService = taskService;
            _signalrSender = signalrSender;
        }


        [HttpGet("{gameId}/open")]
        public async Task<IActionResult> GetOpenTasksAsync(string gameId)
        {
            var user = GetUserAuthContext();
            var id = IdHelper.CheckAndExtractGameId(gameId, user);
            var tasks = await _queryService.GetOpenTasksAsync(id, user);
            return Ok(tasks.Select(t => new TaskModel(t)).ToList());
        }

        [HttpGet("{gameId}/all")]
        public async Task<IActionResult> GetAllTasksAsync(string gameId)
        {
            var user = GetUserAuthContext();
            var id = IdHelper.CheckAndExtractGameId(gameId, user);
            var tasks = await _queryService.GetAllTasksAsync(id, user);
            return Ok(tasks.Select(t => new TaskModel(t)).ToList());
        }

        [HttpPost("{gameId}/task/{taskId}/assignToMe")]
        public async Task<IActionResult> AssignTaskAsync(string gameId, int taskId)
        {
            var user = GetUserAuthContext();
            var id = IdHelper.CheckAndExtractGameId(gameId, user);
            await _taskService.AssignTaskToUserAsync(id, taskId, user);
            return Ok();
        }


        [HttpGet("{gameId}/task/assigned")]
        public async Task<IActionResult> GetAssignedTaskAsync(string gameId)
        {
            var user = GetUserAuthContext();
            var id = IdHelper.CheckAndExtractGameId(gameId, user);
            var task = await _queryService.GetAssignedTaskAsync(id, user);
            if (task == null)
            {
                return NoContent();
            }
            return Ok(new TaskModel(task));
        }

        [HttpPost("{gameId}/task/{taskId}/state")]
        public async Task<IActionResult> UpdateTaskStateAsync(string gameId, int taskId, [FromBody] UpdateTaskStateRequestModel model)
        {
            var user = GetUserAuthContext();
            var id = IdHelper.CheckAndExtractGameId(gameId, user);
            await _taskService.UpdateTaskStateAsync(id, taskId, model.TaskState, user);
            await _signalrSender.SendAsync(user, UpdateScope.GameTasks, gameId, new { taskId });
            return Ok();
        }
    }
}
