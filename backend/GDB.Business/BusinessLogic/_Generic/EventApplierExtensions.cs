using GDB.Common.DTOs._Events;
using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;

namespace GDB.Business.BusinessLogic._Generic
{
    public static class EventApplierExtensions
    {
        public static void EnsureOperationCount(this IEventApplier _, IncomingChangeEvent evt, int expectedCount)
        {
            if (evt.Operations.Count != expectedCount)
            {
                throw new ArgumentException($"Operation count is expected to be {expectedCount} for {evt.Type}", nameof(evt));
            }
        }

        public static bool ToBoolean(this IEventApplier _, object input)
        {
            if (input is JsonElement)
            {
                var asJson = (JsonElement)input;
                if (asJson.ValueKind == JsonValueKind.False)
                {
                    return false;
                }
                if (asJson.ValueKind == JsonValueKind.True)
                {
                    return true;
                }
            }
            return Convert.ToBoolean(input.ToString());
        }

        public static decimal ToDecimal(this IEventApplier _, object input)
        {
            if (input is JsonElement)
            {
                var asJson = (JsonElement)input;
                if (asJson.ValueKind == JsonValueKind.Number)
                {
                    return asJson.GetDecimal();
                }
            }
            return Convert.ToDecimal(input.ToString());
        }

        public static DateTime ToDateTime(this IEventApplier _, object input)
        {
            if (input is JsonElement)
            {
                var asJson = (JsonElement)input;
                if (asJson.ValueKind == JsonValueKind.String)
                {
                    return asJson.GetDateTime().ToUniversalTime();
                }
                if (asJson.ValueKind == JsonValueKind.Number)
                {
                    return asJson.GetDateTime().ToUniversalTime();
                }
            }
            throw new ArgumentException("Cannot recognize type for Date value");
        }
    }
}
