using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Authentication
{
    public interface ICryptoProvider
    {
        bool DoesPasswordMatch(string password, string passwordHash);
        string GenerateResetToken();
        Task<string> GetPasswordHashAsync(string password);
    }
}
