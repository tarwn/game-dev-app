using GDB.Common.DTOs._Events;
using System;
using System.Collections.Generic;
using System.Text;

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
    }
}
