using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Authentication
{
    public interface ISignInManager
    {
        Task<SignInResult> SignInAsync(string UserName, string Password);
    }
}
