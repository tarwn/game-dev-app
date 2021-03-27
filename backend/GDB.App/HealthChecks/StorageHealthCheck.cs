using Azure.Storage.Blobs;
using GDB.Common.Persistence;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace GDB.App.HealthChecks
{
    public class StorageHealthCheck : IHealthCheck
    {
        private IOptions<StorageSettings> _settings;

        public StorageHealthCheck(IOptions<StorageSettings> settings)
        {
            _settings = settings;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default(CancellationToken))
        {
            var timer = new Stopwatch();
            timer.Start();
            try
            {
                var container = new BlobContainerClient(_settings.Value.ConnectionString, "healthcheck");
                await container.CreateIfNotExistsAsync();

                if (await container.ExistsAsync())
                {
                    return HealthCheckResult.Healthy("Storage is healthy", new Dictionary<string, object> { { "checkExecutionTimeMilliseconds", timer.Elapsed.TotalMilliseconds } });
                }
                else
                {
                    return HealthCheckResult.Unhealthy("Storage is degraded: check failed", null, new Dictionary<string, object> { { "checkExecutionTimeMilliseconds", timer.Elapsed.TotalMilliseconds } });
                }
            }
            catch (Exception exc)
            {
                return HealthCheckResult.Unhealthy("Storage error", exc, new Dictionary<string, object> { { "checkExecutionTimeMilliseconds", timer.Elapsed.TotalMilliseconds } });
            }
        }
    }
}
