using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.Interfaces
{
    public interface IIdentifiedTopObject : IIdentifiedObject
    {
        //static string DisplayName { get; }
        public int VersionNumber { get; set; }
    }
}
