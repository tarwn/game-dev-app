using GDB.Common.Authentication;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.Authentication
{
    public class SignInManager : ISignInManager
    {
        public Task<SignInResult> SignInAsync(string UserName, string Password)
        {
            if (UserName == "test@test.dev")
            {
                return Task.FromResult(SignInResult.Success(1, 2, UserName));
            }
            else
            {
                return Task.FromResult(SignInResult.Fail());
            }
        }
    }
}
