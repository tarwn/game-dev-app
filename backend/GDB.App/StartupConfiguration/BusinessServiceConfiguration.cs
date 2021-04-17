using GDB.Business.Authentication;
using GDB.Business.BusinessLogic;
using GDB.Business.BusinessLogic._Generic;
using GDB.Business.BusinessLogic.BusinessModelService;
using GDB.Business.BusinessLogic.CashForecastService;
using GDB.Business.BusinessLogic.EventStore;
using GDB.Business.BusinessLogic.Settings;
using GDB.Common.Authentication;
using GDB.Common.BusinessLogic;
using GDB.Common.DTOs.BusinessModel;
using GDB.Common.DTOs.CashForecast;
using Microsoft.Extensions.Caching.Memory;
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
            services.AddScoped<IBusinessServiceOperator, BusinessServiceOperatorWithRetry>();

            // temporarily a singleton until real cache is added
            services.AddSingleton<ModelEventStore>(s =>
            {
                var cache = new MemoryCache(new MemoryCacheOptions()
                {

                });
                return new ModelEventStore(cache);
            });

            services.AddScoped<IActorService, ActorService>();
            services.AddScoped<BusinessModelEventApplier>();
            services.AddScoped<EventProcessor<BusinessModelDTO, BusinessModelEventApplier>>();
            services.AddScoped<IBusinessModelService, BusinessModelService>();
            services.AddScoped<CashForecastEventApplier>();
            services.AddScoped<EventProcessor<CashForecastDTO, CashForecastEventApplier>>();
            services.AddScoped<ICashForecastService, CashForecastService>();
            services.AddScoped<IGameService, GameService>();
            services.AddScoped<IStudioService, StudioService>();
            services.AddScoped<IUserService, UserService>();
            services.AddScoped<IInteractiveUserQueryService, InteractiveUserQueryService>();

            // security 
            services.AddScoped<ISignInManager, SignInManager>();
            services.AddScoped<ICryptoProvider, CryptoProvider>();
        }
    }
}
