using GDB.App.Controllers.Frontend.Models.BusinessModel;
using GDB.App.Security;
using GDB.Common.BusinessLogic;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.Extensions.Options;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.Controllers.Frontend
{

    [Route("api/fe/businessModels")]
    [Authorize(Policy = Policies.InteractiveUserAccess)]
    public class BusinessModelsController : Controller
    {
        private IInteractiveUserQueryService _queryService;

        public BusinessModelsController(IInteractiveUserQueryService queryService)
        {
            _queryService = queryService;
        }

        [HttpGet("{id}")]
        public IActionResult GetById(string id)
        {
            return Ok(new BusinessModel() { GlobalId = id, GlobalGameId = "ABC-123" });
        }
    }
}
