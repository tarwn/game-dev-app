using GDB.Common.DTOs.Task;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend.Models.Tasks
{
    public class UpdateTaskStateRequestModel
    {
        public TaskState TaskState { get; set; }
    }
}
