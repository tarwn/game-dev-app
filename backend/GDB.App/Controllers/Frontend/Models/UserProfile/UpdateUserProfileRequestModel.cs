using GDB.Common.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend.Models.UserProfile
{
    public class UpdateUserProfileRequestModel
    {
        public int Id { get; set; }
        public AutomaticPopup HasSeenPopup { get; set; }
    }
}
