using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.BusinessModel
{
    public class Applied<T> where T: BusinessModelChangeEvent
    {
        public int VersionNumber { get; set; }
        public int PreviousVersionNumber { get; set; }
        public T Event { get; set; }
    }
}
