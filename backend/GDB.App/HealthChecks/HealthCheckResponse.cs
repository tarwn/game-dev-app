using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Diagnostics.HealthChecks;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text.Json;
using System.Text.Json.Serialization;
using System.Threading.Tasks;

namespace GDB.App.HealthChecks
{
    public static class HealthCheckResponse
    {
        // borrowed from: https://docs.microsoft.com/en-us/aspnet/core/host-and-deploy/health-checks?view=aspnetcore-2.2#customize-output
        public static Task WriteResponse(HttpContext httpContext, HealthReport result)
        {
            var response = new PrettierHealthCheckResponse(result);
            var json = JsonSerializer.Serialize(response, new JsonSerializerOptions()
            {
                WriteIndented = true,
                Converters = {
                    new JsonStringEnumConverter()
                }
            });
            httpContext.Response.ContentType = "application/json";
            return httpContext.Response.WriteAsync(json);
        }

        private class PrettierHealthCheckResponse
        {

            public PrettierHealthCheckResponse(HealthReport result)
            {
                Status = result.Status;
                DurationTotalMilliseconds = result.TotalDuration.TotalMilliseconds;
                Entries = result.Entries.Select(e => new PrettierHealthEvent(e)).ToList();
            }

            public HealthStatus Status { get; }
            public double DurationTotalMilliseconds { get; }
            public object Entries { get; }
        }

        private class PrettierHealthEvent
        {
            public PrettierHealthEvent(KeyValuePair<string, HealthReportEntry> kvp)
            {
                Name = kvp.Key;
                Status = kvp.Value.Status;
                DurationTotalMilliseconds = kvp.Value.Duration.TotalMilliseconds;
            }

            public string Name { get; }
            public HealthStatus Status { get; }
            public double DurationTotalMilliseconds { get; }
        }
    }
}
