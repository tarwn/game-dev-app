using System;
using System.Collections.Generic;

namespace GDB.Common.Authentication
{
    public class ResetPasswordResult
    {
        public ResetPasswordResult()
        {
            ErrorMessages = new List<string>();
        }

        public bool IsSuccessful { get; set; }
        public List<string> ErrorMessages { get; set; }

        public static ResetPasswordResult Success()
        {
            return new ResetPasswordResult()
            {
                IsSuccessful = true
            };
        }

        public static ResetPasswordResult Failure(List<string> errors)
        {
            return new ResetPasswordResult()
            {
                IsSuccessful = false,
                ErrorMessages = errors
            };
        }
    }
}