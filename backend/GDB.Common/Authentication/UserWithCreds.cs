using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.Authentication
{
    public class UserWithCreds
    {
        public int Id { get; set; }
        public string UserName { get; set; }
        public string DisplayName { get; set; }
        public bool MustResetPassword { get; set; }
        public string PasswordHash { get; set; }
    }
}
