using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Authentication
{
    public interface ISignInManager
    {
        //Task<SignInResult> SignInAsync(string UserName, string Password);
        Task<Boolean> AreUserCredentialsValidAsync(string username, string password);
        Task<User> GetUserAsync(string username);
        Task<User> GetUserAsync(int userId);
        Task<string> GeneratePasswordTokenAsync(int userId);
        Task<List<AccessibleStudio>> GetAccessibleStudiosAsync(int id);
        Task<UserSession> CreateSessionAsync(int userId, int studioId);
        Task<bool> IsAccessibleStudioAsync(int userId, int studioId);
        Task<bool> IsResetTokenValidAsync(int userId, string resetToken);
        Task<ResetPasswordResult> ResetPasswordAsync(int userId, string resetToken, string password);
    }
}
