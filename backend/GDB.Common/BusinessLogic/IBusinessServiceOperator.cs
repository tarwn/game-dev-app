using GDB.Common.Persistence;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.BusinessLogic
{
    public interface IBusinessServiceOperator
    {
        Task Operation(Func<IPersistence, Task> action);

        Task<T> Operation<T>(Func<IPersistence, Task<T>> action);

        Task<T> Query<T>(Func<IPersistence, Task<T>> action);
    }
}
