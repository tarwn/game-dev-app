using Microsoft.AspNetCore.Mvc.ModelBinding;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend.Models
{
    public class BadRequestResponseModel
    {
        public BadRequestResponseModel(ModelStateDictionary modelState)
        {
            ErrorType = BadRequestType.FieldErrors;
            FieldErrors = modelState.ToDictionary(k => k.Key, k => k.Value.Errors.Select(e => e.ErrorMessage).ToList());
        }

        public BadRequestResponseModel(string userMessage)
        {
            ErrorType = BadRequestType.GeneralError;
            GeneralError = userMessage;
        }

        public BadRequestType ErrorType { get; }
        public Dictionary<string, List<string>> FieldErrors { get; }
        public string GeneralError { get; }
    }

    public enum BadRequestType
    {
        GeneralError = 1,
        FieldErrors = 2
    }
}
