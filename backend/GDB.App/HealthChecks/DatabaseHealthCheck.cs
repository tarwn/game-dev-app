using GDB.Common.Persistence;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace GDB.App.HealthChecks
{
    public class DatabaseHealthCheck : IHealthCheck
    {
        private IPersistence _persistence;

        public DatabaseHealthCheck(IPersistence persistence)
        {
            _persistence = persistence;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default(CancellationToken))
        {
            var timer = new Stopwatch();
            timer.Start();
            try
            {
                // TODO: replace this with something lighter weight
                var customers = await _persistence.Customers.GetAllAsync();
                if (customers.Count > 0)
                {
                    return HealthCheckResult.Healthy("Database is healthy", new Dictionary<string, object> { { "checkExecutionTimeMilliseconds", timer.Elapsed.TotalMilliseconds } });
                }
                else
                {
                    return HealthCheckResult.Unhealthy("Database is degraded: no query results available", null, new Dictionary<string, object> { { "checkExecutionTimeMilliseconds", timer.Elapsed.TotalMilliseconds } });
                }
            }
            catch (Exception exc)
            {
                return HealthCheckResult.Unhealthy("Database error", exc, new Dictionary<string, object> { { "checkExecutionTimeMilliseconds", timer.Elapsed.TotalMilliseconds } });
            }
        }
    }
}
