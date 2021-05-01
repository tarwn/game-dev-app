using GDB.Common.DTOs.Task;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend.Models.Tasks
{
    public class TaskModel
    {
        public TaskModel(TaskDTO t, string gameId)
        {
            Id = t.Id;
            TaskType = t.TaskType;
            GameId = gameId;
            TaskState = t.TaskState;
            DueDate = t.DueDate;
            CreatedOn = t.CreatedOn;
            CreatedBy = t.CreatedBy;
            UpdatedOn = t.UpdatedOn;
            UpdatedBy = t.UpdatedBy;
            ClosedOn = t.ClosedOn;
            ClosedBy = t.ClosedBy;
        }

        public int Id { get; set; }
        public TaskType TaskType { get; set; }
        public string GameId { get; set; }
        public TaskState TaskState { get; set; }
        public DateTime? DueDate { get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? ClosedOn { get; set; }
        public int? ClosedBy { get; set; }

    }
}
