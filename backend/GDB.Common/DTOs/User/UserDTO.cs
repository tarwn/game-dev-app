using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.User
{
    public class UserDTO
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string DisplayName { get; set; }

        public AutomaticPopup HasSeenPopup { get; set; }
    }

    [Flags]
    public enum AutomaticPopup { 
        None = 0,
        GameDashboard = 1,
        BusinessModel = 2,
        CashForecast = 4
    }
}
