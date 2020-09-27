using System;
using Microsoft.Practices.EnterpriseLibrary.TransientFaultHandling;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;
using System.Transactions;

namespace GDB.Business.BusinessLogic
{
    public abstract class BusinessServiceBase
    {
        private readonly RetryPolicy _retryPolicy;

        public BusinessServiceBase()
        {
            // mix of suggestions from MSDN
            // https://docs.microsoft.com/en-us/azure/architecture/best-practices/retry-service-specific#sql-database-using-adonet
            // 1. Chose Exponential backoff based on experience 
            // 2. Used shorter timeframes similar to MSDN suggestions due to interactive users and
            //      small batches when we have batch data
            _retryPolicy = new RetryPolicy<SqlDatabaseTransientErrorDetectionStrategy>(
                3,
                TimeSpan.FromMilliseconds(100),
                TimeSpan.FromMilliseconds(500),
                TimeSpan.FromMilliseconds(50));
        }

        protected async Task BusinessOperation(Func<Task> action)
        {
            await _retryPolicy.ExecuteAsync(async () =>
            {
                using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
                {
                    await action();
                    scope.Complete();
                }
            });
        }

        protected async Task<T> BusinessOperation<T>(Func<Task<T>> action)
        {
            T outerResult = await _retryPolicy.ExecuteAsync(async () =>
            {
                using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
                {
                    T innerResult = await action();
                    scope.Complete();
                    return innerResult;
                }
            });
            return outerResult;
        }

        protected async Task<T> BusinessQuery<T>(Func<Task<T>> action)
        {
            T outerResult = await _retryPolicy.ExecuteAsync(async () =>
            {
                using (var scope = new TransactionScope(TransactionScopeAsyncFlowOption.Enabled))
                {
                    T innerResult = await action();
                    scope.Complete();
                    return innerResult;
                }
            });
            return outerResult;
        }
    }
}
