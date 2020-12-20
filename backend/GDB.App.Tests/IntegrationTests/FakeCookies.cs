using GDB.App.Controllers.General.Utility;
using Microsoft.AspNetCore.Http;
using System;
using System.Collections.Generic;
using System.Security.Claims;
using System.Text;
using System.Threading.Tasks;

namespace GDB.App.Tests.IntegrationTests
{
    public class FakeCookies : IAccountCookies
    {
        public string PresetValue { get; set;  }

        public void ClearChooserCookie(HttpContext httpContext, string chooserCookieName)
        {
            
        }

        public string GetChooserCookie(HttpContext httpContext, string chooserCookieName)
        {
            return PresetValue;
        }

        public void SetChooserCookie(HttpContext httpContext, string chooserCookieName, string protectedValue)
        {
            PresetValue = protectedValue;
        }

        public Task SignInAsync(HttpContext httpContext, string cookieName, ClaimsPrincipal principal)
        {
            return Task.FromResult(true);
        }
    }
}
