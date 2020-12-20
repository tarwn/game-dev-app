using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;

namespace GDB.App.Controllers.General.Utility
{
    public class AccountCookies : IAccountCookies
    {
        public async Task SignInAsync(HttpContext httpContext, string cookieName, ClaimsPrincipal principal)
        {
            await httpContext.SignInAsync(cookieName, principal);
        }

        public void ClearChooserCookie(HttpContext httpContext, string cookieName)
        {
            httpContext.Response.Cookies.Delete(cookieName);
        }

        public void SetChooserCookie(HttpContext httpContext, string cookieName, string value)
        {
            httpContext.Response.Cookies.Append(cookieName, value, new CookieOptions()
            {
                HttpOnly = true,
                IsEssential = true,
                SameSite = SameSiteMode.Strict,
                Secure = true
            });
        }

        public string GetChooserCookie(HttpContext httpContext, string cookieName)
        {
            var rawContent = httpContext.Request.Cookies[cookieName];
            if (string.IsNullOrEmpty(rawContent))
            {
                return null;
            }
            return rawContent;
        }


    }
}
