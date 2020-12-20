using GDB.Common.Authentication;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.App.Tests.IntegrationTests
{
    public class FakeCrypto : ICryptoProvider
    {
        public string PresetResetToken { get; set; }

        public bool DoesPasswordMatch(string password, string passwordHash)
        {
            return HashPassword(password) == passwordHash;
        }

        public string GenerateResetToken()
        {
            return PresetResetToken;
        }

        public Task<string> GetPasswordHashAsync(string password)
        {
            return Task.FromResult(HashPassword(password));
        }

        public string HashPassword(string password)
        {
            var chars = password.ToCharArray();
            Array.Reverse(chars);
            return String.Join("", chars);
        }
    }
}
