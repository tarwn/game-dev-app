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
    public class DataProtectionKeysHealthCheck : IHealthCheck
    {
        private IOptions<StorageSettings> _storageSettings;
        private IOptions<DataProtectionSettings> _dataProtectionSettings;

        public DataProtectionKeysHealthCheck(IOptions<StorageSettings> storageSettings, IOptions<DataProtectionSettings> dataProtectionSettings)
        {
            _storageSettings = storageSettings;
            _dataProtectionSettings = dataProtectionSettings;
        }

        public async Task<HealthCheckResult> CheckHealthAsync(HealthCheckContext context, CancellationToken cancellationToken = default(CancellationToken))
        {
            var timer = new Stopwatch();
            timer.Start();
            try
            {
                var container = new BlobContainerClient(_storageSettings.Value.ConnectionString, _dataProtectionSettings.Value.StorageKeyContainer);
                if (!await container.ExistsAsync(cancellationToken))
                {
                    return HealthCheckResult.Unhealthy("DataProtection is degraded: check 1 failed", null, new Dictionary<string, object> { { "checkExecutionTimeMilliseconds", timer.Elapsed.TotalMilliseconds } });
                }

                var blob = container.GetBlobClient(_dataProtectionSettings.Value.StorageKeyBlob);
                if (!await blob.ExistsAsync(cancellationToken))
                {
                    return HealthCheckResult.Unhealthy("DataProtection is degraded: check 2 failed", null, new Dictionary<string, object> { { "checkExecutionTimeMilliseconds", timer.Elapsed.TotalMilliseconds } });
                }

                return HealthCheckResult.Healthy("DataProtection is healthy", new Dictionary<string, object> { { "checkExecutionTimeMilliseconds", timer.Elapsed.TotalMilliseconds } });
            }
            catch (Exception exc)
            {
                return HealthCheckResult.Unhealthy("DataProtection error", exc, new Dictionary<string, object> { { "checkExecutionTimeMilliseconds", timer.Elapsed.TotalMilliseconds } });
            }
        }
    }
}
