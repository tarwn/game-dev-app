using GDB.Common.DTOs.User;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend.Models.UserProfile
{
    public class UserProfileModel
    {
        public UserProfileModel(UserDTO user)
        {
            Id = user.Id;
            UserName = user.UserName;
            DisplayName = user.DisplayName;
            HasSeenPopup = user.HasSeenPopup;
        }

        public int Id { get; set; }
        public string UserName { get; set; }
        public string DisplayName { get; set; }

        public AutomaticPopup HasSeenPopup { get; set; }
    }
}
