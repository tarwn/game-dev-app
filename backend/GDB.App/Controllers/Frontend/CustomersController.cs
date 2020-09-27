using GDB.App.Security;
using GDB.App.StartupConfiguration;
using GDB.Common.BusinessLogic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Runtime.InteropServices.ComTypes;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{
    [Route("api/fe/customers")]
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class CustomersController : Controller
    {
        private IInteractiveUserQueryService _userQueries;

        public CustomersController(IInteractiveUserQueryService userQueries)
        {
            _userQueries = userQueries;
        }

        [HttpGet]
        public async Task<IActionResult> GetCustomersAsync()
        {
            var customers = await _userQueries.GetAllCustomersAsync();
            return Ok(customers);
        }
    }
}
