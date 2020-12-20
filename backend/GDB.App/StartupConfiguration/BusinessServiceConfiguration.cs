using GDB.Business.Authentication;
using GDB.Business.BusinessLogic;
using GDB.Common.Authentication;
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
            services.AddSingleton<TemporaryBusinessModelStore>();

            services.AddScoped<IBusinessServiceOperator, BusinessServiceOperatorWithRetry>();
            services.AddScoped<IBusinessModelService, BusinessModelService>();
            services.AddScoped<IInteractiveUserQueryService, InteractiveUserQueryService>();

            // security 
            services.AddScoped<ISignInManager, SignInManager>();
            services.AddScoped<ICryptoProvider, CryptoProvider>();
        }
    }
}
