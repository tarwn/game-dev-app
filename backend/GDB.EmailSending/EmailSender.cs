using FluentEmail.Core;
using GDB.Common;
using GDB.EmailSending.Templates;
using Microsoft.Extensions.Logging;
using System;
using System.Collections.Generic;
using System.IO;
using System.Threading.Tasks;

namespace GDB.EmailSending
{
    public class EmailSender : IEmailSender
    {
        private IFluentEmailFactory _emailFactory;
        private ILogger<EmailSender> _logger;

        public EmailSender(IFluentEmailFactory emailFactory, ILogger<EmailSender> logger)
        {
            _emailFactory = emailFactory;
            _logger = logger;
        }

        public async Task<bool> SendPasswordResetEmail(string to, ResetPasswordData data)
        {
            var email = _emailFactory.Create()
                .To(to)
                .Subject("Your LaunchReady password reset request")
                .UsingTemplateFromEmbedded("GDB.EmailSending.Templates.ResetPassword.cshtml", data, GetType().Assembly, true);

            var result = await email.SendAsync();

            if (!result.Successful)
            {
                _logger.LogError("Failed to send an email.\n{Errors}", string.Join(Environment.NewLine, result.ErrorMessages));
            }

            return result.Successful;
        }

        public async Task<bool> SendWelcomeEmail(string to, WelcomeData data)
        {
            var email = _emailFactory.Create()
                .To(to)
                .Subject("Thanks for signing up for LaunchReady!")
                .UsingTemplateFromEmbedded("GDB.EmailSending.Templates.Welcome.cshtml", data, GetType().Assembly, true);

            var result = await email.SendAsync();

            if (!result.Successful)
            {
                _logger.LogError("Failed to send an email.\n{Errors}", string.Join(Environment.NewLine, result.ErrorMessages));
            }

            return result.Successful;
        }
    }
}
