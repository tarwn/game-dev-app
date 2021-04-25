using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;
using GDB.Common.Persistence;
using Microsoft.ApplicationInsights;
using GDB.Common.BusinessLogic;
using GDB.Business.Utility;
using Microsoft.Practices.EnterpriseLibrary.TransientFaultHandling;

namespace GDB.Business.BusinessLogic
{
    public class BusinessServiceOperatorWithRetry: IBusinessServiceOperator
    {
        private readonly RetryPolicy _retryPolicy;
        private IPersistence _persistence;

        public BusinessServiceOperatorWithRetry(IPersistence persistence)
        {
            _persistence = persistence;

            // mix of suggestions from MSDN
            // https://docs.microsoft.com/en-us/azure/architecture/best-practices/retry-service-specific#sql-database-using-adonet
            // 1. Chose Exponential backoff based on experience 
            // 2. Used shorter timeframes similar to MSDN suggestions due to interactive users and
            //      small batches when we have batch data
            _retryPolicy = new RetryPolicy<DatabaseErrorDetection>(
                3,
                TimeSpan.FromMilliseconds(100),
                TimeSpan.FromMilliseconds(500),
                TimeSpan.FromMilliseconds(50));
        }

        public async Task Operation(Func<IPersistence, Task> action)
        {
            await _retryPolicy.ExecuteAsync(async () =>
            {
                using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
                {
                    await action(_persistence);
                    scope.Complete();
                }
            });
        }

        public async Task<T> Operation<T>(Func<IPersistence, Task<T>> action)
        {
            T outerResult = await _retryPolicy.ExecuteAsync(async () =>
            {
                using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
                {
                    T innerResult = await action(_persistence);
                    scope.Complete();
                    return innerResult;
                }
            });
            return outerResult;
        }

        public async Task<T> Query<T>(Func<IPersistence, Task<T>> action)
        {
            T outerResult = await _retryPolicy.ExecuteAsync(async () =>
            {
                using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
                {
                    T innerResult = await action(_persistence);
                    scope.Complete();
                    return innerResult;
                }
            });
            return outerResult;
        }
    }
}
