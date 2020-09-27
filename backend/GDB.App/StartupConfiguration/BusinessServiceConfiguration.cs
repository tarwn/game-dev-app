﻿using GDB.Business.BusinessLogic;
using GDB.Common.BusinessLogic;
using Microsoft.Extensions.DependencyInjection;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;

namespace GDB.App.StartupConfiguration
{
    public class BusinessServiceConfiguration
    {
        public static void Configure(IServiceCollection services)
        {
            services.AddScoped<IInteractiveUserQueryService, InteractiveUserQueryService>();
        }
    }
}
