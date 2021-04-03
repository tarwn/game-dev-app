using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common
{
    public class Helper
    {
        public static DateTime GetUtcDate(int year, int month, int day)
        {
            return new DateTime(year, month, day, 0, 0, 0, DateTimeKind.Utc);
        }
    }
}
