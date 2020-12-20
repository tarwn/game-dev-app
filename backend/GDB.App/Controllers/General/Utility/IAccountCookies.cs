using Microsoft.AspNetCore.Http;
using System.Security.Claims;
using System.Security.Principal;
using System.Threading.Tasks;

namespace GDB.App.Controllers.General.Utility
{
    public interface IAccountCookies
    {
        public Task SignInAsync(HttpContext httpContext, string cookieName, ClaimsPrincipal principal);
        void ClearChooserCookie(HttpContext httpContext, string chooserCookieName);
        void SetChooserCookie(HttpContext httpContext, string chooserCookieName, string protectedValue);
        string GetChooserCookie(HttpContext httpContext, string chooserCookieName);
    }
}