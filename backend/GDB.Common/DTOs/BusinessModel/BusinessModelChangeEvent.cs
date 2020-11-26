using System;
using System.Collections.Generic;
using System.Text;
using System.Text.Json;

namespace GDB.Common.DTOs.BusinessModel
{

    // change to C# 5 + https://github.com/wivuu/Wivuu.JsonPolymorphism?
    public class BusinessModelChangeEvent
    {
        public BusinessModelChangeEvent() { }

        public BusinessModelChangeEvent(string type, int versionNumber)
        {
            Type = type;
            VersionNumber = versionNumber;
        }

        public string Type { get; set; }
        public int VersionNumber { get; set; }

        public JsonElement Change { get; set; }
    }
}
