using GDB.Common.Authentication;
using System;
using System.Collections.Generic;
using System.Security.Cryptography;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.Authentication
{
    public class CryptoProvider : ICryptoProvider
    {
        public const int ResetTokenGenerationByteLength = 40;
        public const int WorkFactor = 12;

        public bool DoesPasswordMatch(string password, string passwordHash)
        {
            return BCrypt.Net.BCrypt.Verify(password, passwordHash);
        }

        public string GenerateResetToken()
        {
            using (var provider = new RNGCryptoServiceProvider())
            {
                byte[] byteArray = new byte[ResetTokenGenerationByteLength];
                provider.GetBytes(byteArray);
                return Convert.ToBase64String(byteArray);
            }
        }

        public async Task<string> GetPasswordHashAsync(string password)
        {
            return await Task.Run(() => BCrypt.Net.BCrypt.HashPassword(password, WorkFactor)).ConfigureAwait(false);
        }
    }
}
