using GDB.Common.Authentication;
using GDB.Common.BusinessLogic;
using GDB.Common.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.Authentication
{
    public class SignInManager : ISignInManager
    {
        private IBusinessServiceOperator _busOp;
        private ICryptoProvider _crypto;

        public const string ERROR_MIN_LENGTH = "Must be at least 8 characters long";
        public const string ERROR_MAX_LENGTH = "Must be less than 60 characters long";
        public const string ERROR_CHARACTERS = "Can only contain ASCII or whitespace characters";
        public const string ERROR_ALL_WHITESPACE = "Must have something besides spaces in it o_O";
        public const string ERROR_ALL_SAME = "Cannot be all one character O_o";
        public const string ERROR_USERNAME = "Cannot include username";

        public SignInManager(IBusinessServiceOperator busOp, ICryptoProvider crypto)
        {
            _busOp = busOp;
            _crypto = crypto;
        }

        //public Task<SignInResult> SignInAsync(string UserName, string Password)
        //{
        //    if (UserName == "test@test.dev")
        //    {
        //        return Task.FromResult(SignInResult.Success(1, 2, UserName));
        //    }
        //    else
        //    {
        //        return Task.FromResult(SignInResult.Fail());
        //    }
        //}

        public async Task<bool> AreUserCredentialsValidAsync(string username, string password)
        {
            return await _busOp.Query(async (persistence) =>
            {
                var user = await persistence.Users.GetAuthWithCredentialsByUsernameAsync(username);
                if (user == null)
                {
                    return false;
                }

                return _crypto.DoesPasswordMatch(password, user.PasswordHash);
            });
        }

        public async Task<UserSession> CreateSessionAsync(int userId, int studioId)
        {
            return await _busOp.Operation(async (persistence) =>
            {
                return await persistence.UserSessions.CreateSessionAsync(userId, studioId, DateTime.UtcNow, DateTime.UtcNow.AddDays(1));
            });
        }

        public async Task<string> GeneratePasswordTokenAsync(int userId)
        {
            return await _busOp.Operation(async (persistence) =>
            {
                var newToken = _crypto.GenerateResetToken();
                await persistence.PasswordResetTokens.AddTokenAsync(userId, newToken, DateTime.UtcNow, DateTime.UtcNow.AddDays(1));
                return newToken;
            });
        }

        public async Task<List<AccessibleStudio>> GetAccessibleStudiosAsync(int userId)
        {
            return await _busOp.Query(async (persistence) =>
            {
                return await persistence.Studios.GetAccessibleStudiosByUserAsync(userId);
            });
        }

        public async Task<User> GetUserAsync(string username)
        {
            return await _busOp.Query(async (persistence) =>
            {
                return await persistence.Users.GetAuthByUsernameAsync(username);
            });
        }

        public async Task<User> GetUserAsync(int userId)
        {
            return await _busOp.Query(async (persistence) =>
            {
                return await persistence.Users.GetAuthByIdAsync(userId);
            });
        }

        public async Task<bool> IsAccessibleStudioAsync(int userId, int studioId)
        {
            return await _busOp.Query(async (persistence) =>
            {
                return await persistence.Studios.IsAccessibleByUserAsync(userId, studioId);
            });
        }

        public async Task<bool> IsResetTokenValidAsync(int userId, string resetToken)
        {
            return await _busOp.Query(async (persistence) =>
            {
                var token = await persistence.PasswordResetTokens.GetAsync(userId, resetToken);
                if (token == null)
                {
                    return false;
                }
                if (token.TargetUserId != userId)
                {
                    return false;
                }
                if (token.GoodThrough < DateTime.UtcNow)
                {
                    return false;
                }
                return true;
            });
        }

        public async Task<ResetPasswordResult> ResetPasswordAsync(int userId, string resetToken, string password)
        {
            // todo - validations
            //  - can't match last used one
            //  - doesn't contain username
            return await _busOp.Query(async (persistence) =>
            {
                var user = await persistence.Users.GetAuthByIdAsync(userId);

                var errors = new List<string>();
                if (password.Length < 8)
                {
                    errors.Add(ERROR_MIN_LENGTH);
                }
                if (password.Length > 60)
                {
                    errors.Add(ERROR_MAX_LENGTH);
                }
                if (!password.All(c => c == ' ' || (c > 31 && c < 256)))
                {
                    errors.Add(ERROR_CHARACTERS);
                }
                if (password.Length > 1 && password.All(c => c == password[0]))
                {
                    errors.Add(ERROR_ALL_SAME);
                }
                if (password.Length > 1 && password.Trim().Length == 0)
                {
                    errors.Add(ERROR_ALL_WHITESPACE);
                }
                if (password.Contains(user.UserName))
                {
                    errors.Add(ERROR_USERNAME);
                }

                if (errors.Count > 0) {
                    return ResetPasswordResult.Failure(errors);
                }

                var passwordHash = await _crypto.GetPasswordHashAsync(password);
                await persistence.Users.UpdatePasswordAsync(userId, passwordHash, DateTime.UtcNow, userId);
                await persistence.PasswordHistory.CreateAsync(userId, passwordHash, DateTime.UtcNow);
                await persistence.PasswordResetTokens.UpdateTokenAsUsedAsync(userId, resetToken, DateTime.UtcNow);
                return ResetPasswordResult.Success();
            });
        }
    }
}
