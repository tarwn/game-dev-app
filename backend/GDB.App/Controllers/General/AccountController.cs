using GDB.App.Controllers.General.Models;
using GDB.App.Controllers.General.Utility;
using GDB.App.Security;
using GDB.App.StartupConfiguration;
using GDB.Common.Authentication;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.DataProtection;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Cryptography;
using System.Threading.Tasks;

namespace GDB.App.Controllers.General
{
    [AllowAnonymous]
    [Area("General")]
    [Route("/account")]
    public class AccountController : Controller
    {
        private ISignInManager _signInManager;
        private ITimeLimitedDataProtector _protector;
        private IAccountCookies _cookieHandler;
        private const string ChooserCookieName = "gdbchs";
        private const int TenantChooserCookieLifetimeMinutes = 5;

        public AccountController(ISignInManager signInManager, IDataProtectionProvider dataProtectionProvider, IAccountCookies cookieHandler)
        {
            _signInManager = signInManager;
            _protector = dataProtectionProvider.CreateProtector("StudioChooserCookie")
                                               .ToTimeLimitedDataProtector();
            _cookieHandler = cookieHandler;
        }

        [HttpGet("login")]
        public async Task<IActionResult> LoginAsync(string returnUrl = null)
        {
            ClearChooserState();
            if (User.Identity.IsAuthenticated)
            {
                // they're already logged in - log them out and redirect
                //  we redirect because AntiForgery uses Principal when it generates the token so we need a clean request
                await HttpContext.SignOutAsync(SecurityConstants.CookieAuthScheme, new AuthenticationProperties()
                {
                    RedirectUri = "/account/login"
                });
            }
            return View("Login", new LoginModel { ReturnUrl = returnUrl });
        }

        [HttpPost("login")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> LoginAsync([FromForm] LoginModel model)
        {
            if (!ModelState.IsValid)
            {
                ModelState.AddModelError("", "Username and password are both required");
                ViewData["ErrorMessage"] = "Username and password are both required";
                return View("Login", model);
            }

            var credentialsAreValid = await _signInManager.AreUserCredentialsValidAsync(model.Username, model.Password);
            if (!credentialsAreValid)
            {
                ModelState.AddModelError("", "Username or password not found");
                ViewData["ErrorMessage"] = "Username or password not found";
                return View("Login", model);
            }

            var user = await _signInManager.GetUserAsync(model.Username);

            if (user.MustResetPassword)
            {
                var passwordResetToken = await _signInManager.GeneratePasswordTokenAsync(user.Id);

                return RedirectToAction("ResetPassword", new { resetToken = passwordResetToken, username = user.UserName, returnUrl = model.ReturnUrl });
            }

            var studios = await _signInManager.GetAccessibleStudiosAsync(user.Id);

            if (studios.Count == 0)
            {
                ViewData["ErrorMessage"] = "Username or password not found";
                return View("Login", model);
            }


            if (studios.Count > 1)
            {
                SetChooserState(user.Id);
                return RedirectToAction("StudioChoice", new { returnUrl = model.ReturnUrl });
            }


            await CompleteLoginAsync(user.Id, studios[0].Id);
            return LocalRedirect(GetSafeRedirectUrl(model.ReturnUrl));
        }

        [HttpGet("login/studio")]
        public async Task<IActionResult> StudioChoiceAsync(string returnUrl)
        {
            var userId = GetChooserState();
            if (userId == null)
            {
                return Redirect("/account/login");
            }

            var studios = await _signInManager.GetAccessibleStudiosAsync(userId.Value);
            return View(new StudioChoiceModel(userId.Value, studios, returnUrl));
        }

        [HttpPost("login/studio")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> StudioChoiceAsync(StudioChoiceInputModel model)
        {
            var userId = GetChooserState();
            if (userId == null)
            {
                return Redirect("/account/login");
            }

            if (!ModelState.IsValid)
            {
                var studios = await _signInManager.GetAccessibleStudiosAsync(userId.Value);
                return View("StudioChoice", new StudioChoiceModel(userId.Value, studios, model.ReturnUrl));
            }

            if (!await _signInManager.IsAccessibleStudioAsync(userId.Value, model.StudioId))
            {
                ViewData["ErrorMessage"] = "Username or password not found";
                var studios = await _signInManager.GetAccessibleStudiosAsync(userId.Value);
                return View("StudioChoice", new StudioChoiceModel(userId.Value, studios, model.ReturnUrl));
            }

            ClearChooserState();
            await CompleteLoginAsync(userId.Value, model.StudioId);
            return LocalRedirect(GetSafeRedirectUrl(model.ReturnUrl));
        }

        private string GetSafeRedirectUrl(string url)
        {
            if (Url.IsLocalUrl(url))
            {
                return url;
            }
            return "/";
        }

        #region Cookies

        private void ClearChooserState()
        {
            _cookieHandler.ClearChooserCookie(HttpContext, ChooserCookieName);
        }

        private void SetChooserState(int userId)
        {
            var protectedValue = _protector.Protect(userId.ToString(), TimeSpan.FromMinutes(TenantChooserCookieLifetimeMinutes));
            _cookieHandler.SetChooserCookie(HttpContext, ChooserCookieName, protectedValue);
        }

        private int? GetChooserState()
        {
            try
            {
                var rawContent = _cookieHandler.GetChooserCookie(HttpContext, ChooserCookieName);
                if (string.IsNullOrEmpty(rawContent))
                {
                    return null;
                }

                var decryptedValue = _protector.Unprotect(rawContent);
                if (int.TryParse(decryptedValue, out var userId))
                {
                    return userId;
                }
                return null;
            }
            catch (CryptographicException)
            {
                return null;
            }
        }

        private async Task CompleteLoginAsync(int userId, int studioId)
        {
            var session = await _signInManager.CreateSessionAsync(userId, studioId);
            var user = await _signInManager.GetUserAsync(userId);

            var identity = new ClaimsIdentity(new List<Claim>() {
                new Claim(ClaimNames.SessionId, session.Id.ToString()),
                new Claim(ClaimNames.UserId, session.UserId.ToString()),
                new Claim(ClaimNames.StudioId, session.StudioId.ToString()),
                new Claim(ClaimNames.UserName, user.UserName)
            }, SecurityConstants.CookieAuthScheme);
            var principal = new ClaimsPrincipal(identity);
            await _cookieHandler.SignInAsync(HttpContext, SecurityConstants.CookieAuthScheme, principal);
        }

        #endregion

        [HttpGet("forgotPassword")]
        public IActionResult ForgotPassword()
        {
            return View("ForgotPassword");
        }

        [HttpPost("forgotPassword")]
        public async Task<IActionResult> ForgotPasswordAsync(string username)
        {
            if (!ModelState.IsValid)
            {
                return View("ForgotPassword");
            }

            var user = await _signInManager.GetUserAsync(username);
            if (user != null)
            {
                var token = await _signInManager.GeneratePasswordTokenAsync(user.Id);
                //TODO: send the email with the token
            }
            return View("ForgotPasswordEmailSent");
        }

        [HttpGet("resetPassword")]
        public async Task<IActionResult> ResetPassword(string userName, string resetToken)
        {
            var user = await _signInManager.GetUserAsync(userName);
            if (user == null)
            {
                return RedirectToAction("ResetPasswordFailure");
            }

            if (!await _signInManager.IsResetTokenValidAsync(user.Id, resetToken))
            {
                return RedirectToAction("ResetPasswordFailure");
            }

            return View("ResetPassword", new ResetPasswordModel(user.Id, resetToken));
        }

        [HttpPost("resetPassword")]
        [ValidateAntiForgeryToken]
        public async Task<IActionResult> ResetPassword(ResetPasswordInputModel model)
        {
            if (!ModelState.IsValid)
            {
                return View("ResetPassword", ResetPasswordModel.From(model));
            }

            var result = await _signInManager.ResetPasswordAsync(model.UserId, model.ResetToken, model.Password);
            if (result.IsSuccessful)
            {
                return RedirectToAction("ResetPasswordSuccess");
            }

            result.ErrorMessages.ForEach((m) => ModelState.AddModelError("Password", m));
            return View("ResetPassword", ResetPasswordModel.From(model));
        }

        [HttpGet("resetPasswordSuccess")]
        public IActionResult ResetPasswordSuccess()
        {
            return View();
        }

        [HttpGet("resetPasswordFailure")]
        public IActionResult ResetPasswordFailure()
        {
            return View();
        }

        [HttpGet("logout")]
        public async Task<IActionResult> LogoutAsync()
        {
            await HttpContext.SignOutAsync(SecurityConstants.CookieAuthScheme);
            return View("Logout");
        }


        [HttpGet("accessDenied")]
        public IActionResult AccessDenied()
        {
            return View("AccessDenied");
        }
    }
}
