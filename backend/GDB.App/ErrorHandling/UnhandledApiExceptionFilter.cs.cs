using GDB.Common.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace GDB.App.ErrorHandling
{
    public class UnhandledApiExceptionFilter : IActionFilter, IOrderedFilter
    {
        private string[] _pathFilters;

        public int Order => int.MaxValue - 10;

        public UnhandledApiExceptionFilter(string[] pathFilters)
        {
            _pathFilters = pathFilters;
        }

        public void OnActionExecuted(ActionExecutedContext context)
        {
            if (context.Exception != null && _pathFilters.Any(p => context.HttpContext.Request.Path.StartsWithSegments(p)))
            {
                // TODO: Report Exception Here

                if (context.Exception is AccessDeniedException)
                {
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    context.Result = new ObjectResult(new ErrorDetails
                    {
                        StatusCode = HttpStatusCode.Unauthorized,
                        Message = context.Exception.Message,
                        Type = typeof(Exception).Name
                    });
                    context.ExceptionHandled = true;
                }
                else if (context.Exception is AuthorizationDeniedException)
                {
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.Unauthorized;
                    context.Result = new ObjectResult(new ErrorDetails
                    {
                        StatusCode = HttpStatusCode.Unauthorized,
                        Message = context.Exception.Message,
                        Type = typeof(Exception).Name
                    });
                    context.ExceptionHandled = true;
                }
                else
                {
                    context.HttpContext.Response.StatusCode = (int)HttpStatusCode.InternalServerError;
                    context.Result = new ObjectResult(new ErrorDetails
                    {
                        StatusCode = HttpStatusCode.InternalServerError,
                        Message = "Internal Server Error.",
                        Type = typeof(Exception).Name
                    });
                }
#if !DEBUG
                context.ExceptionHandled = true;
#endif
            }
        }

        public void OnActionExecuting(ActionExecutingContext context)
        {

        }
    }

    public class ErrorDetails
    {
        public HttpStatusCode StatusCode { get; set; }
        public string Message { get; set; }
        public string Type { get; set; }
    }
}
