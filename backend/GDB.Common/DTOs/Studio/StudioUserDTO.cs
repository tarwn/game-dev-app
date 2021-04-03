using GDB.Common.DTOs.User;
using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.DTOs.Studio
{
    public class StudioUserDTO : UserDTO
    {
        public StudioUserRole Role { get; set; }
        public StudioUserAccess Access { get; set; }
        public DateTime? InvitedOn { get; set; }
        public int? InvitedBy { get; set; }
        public DateTime? InviteGoodThrough { get; set; }
    }
}
