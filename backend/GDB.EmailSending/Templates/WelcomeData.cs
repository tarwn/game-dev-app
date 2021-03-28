using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.EmailSending.Templates
{
    public class WelcomeData
    {
        public WelcomeData(string name, string username, string passwordResetLink, int hours)
        {
            Name = name;
            Username = username;
            PasswordResetLink = passwordResetLink;
            LinkHours = hours;
        }

        public string Name { get; }
        public string Username { get; }
        public string PasswordResetLink { get; }
        public int LinkHours { get; }
    }
}
