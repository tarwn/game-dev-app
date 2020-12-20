using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.Authentication
{
    public class PasswordResetToken
    {
        public int Id { get; set; }
        public int TargetUserId { get; set; }
        public string ResetToken { get; set; }
        public DateTime CreatedOn { get; set; }
        public DateTime GoodThrough { get; set; }
        public DateTime? UsedOn { get; set; }
    }
}
