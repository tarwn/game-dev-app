using System;
using System.Collections.Generic;
using System.Text;

namespace GDB.Common.Authentication
{
    public class SignInResult
    {
        public bool IsSuccessful { get; private set; }
        public int? SessionId { get; private set; }
        public int? UserId { get; private set; }
        public string UserName { get; private set; }

        public static SignInResult Success(int sessionId, int userId, string userName)
        {
            return new SignInResult()
            {
                IsSuccessful = true,
                SessionId = sessionId,
                UserId = userId,
                UserName = userName
            };
        }

        public static SignInResult Fail()
        {
            return new SignInResult()
            {
                IsSuccessful = false
            };
        }
    }
}
