using GDB.Common.BusinessLogic;
using GDB.Common.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic
{
    public class TaskService : ITaskService
    {
        private IBusinessServiceOperator _busOp;
        private IPersistence _persistence;

        public TaskService(IBusinessServiceOperator busOp, IPersistence persistence)
        {
            _busOp = busOp;
            _persistence = persistence;
        }
    }
}
