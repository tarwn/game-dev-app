using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.DTOs.Task
{
    public class TaskDTO
    {
        public int Id { get; set; }
        public TaskType TaskType { get; set; }
        public int GameId { get; set; }
        public TaskState TaskState { get; set; }
        public DateTime? DueDate{ get; set; }
        public DateTime CreatedOn { get; set; }
        public int CreatedBy { get; set; }
        public DateTime? UpdatedOn { get; set; }
        public int? UpdatedBy { get; set; }
        public DateTime? ClosedOn { get; set; }
        public int? ClosedBy { get; set; }
    }
}
