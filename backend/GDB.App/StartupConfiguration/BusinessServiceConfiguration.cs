﻿using GDB.Business.Authentication;
using GDB.Business.BusinessLogic;
using GDB.Business.BusinessLogic.BusinessModelService;
using GDB.Business.BusinessLogic.EventStore;
using GDB.Common.Authentication;
using GDB.Common.BusinessLogic;
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
            services.AddSingleton<ModelEventStore>(s => {
                var cache = new MemoryCache(new MemoryCacheOptions() { 
                     
                });
                return new ModelEventStore(cache);
            });
            //services.AddSingleton<TemporaryBusinessModelStore>();

            services.AddScoped<IActorService, ActorService>();
            services.AddScoped<BusinessModelProcessor>();
            services.AddScoped<IBusinessModelService, BusinessModelService>();
            services.AddScoped<IInteractiveUserQueryService, InteractiveUserQueryService>();

            // security 
            services.AddScoped<ISignInManager, SignInManager>();
            services.AddScoped<ICryptoProvider, CryptoProvider>();
        }
    }
}
