using GDB.EmailSending.Templates;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.EmailSending
{
    public interface IEmailSender
    {
        Task<bool> SendWelcomeEmail(string to, WelcomeData data);
        Task<bool> SendPasswordResetEmail(string to, ResetPasswordData data);
    }
}
