using GDB.Common.DTOs.Interfaces;
using System;

namespace GDB.Common.DTOs.CashForecast
{
    public class Revenue : IIdentifiedObject
    {
        [Obsolete("serialization only", false)]
        public Revenue() { }

        public string GlobalId { get; set; }
        public string ParentId { get; set; }
        public string Field { get; set; }

        public IdentifiedPrimitive<string> Name { get; set; }
    }
}