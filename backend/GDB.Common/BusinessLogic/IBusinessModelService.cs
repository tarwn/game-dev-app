﻿using GDB.Common.Context;
using GDB.Common.DTOs._Events;
using GDB.Common.DTOs.BusinessModel;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.BusinessLogic
{
    public interface IBusinessModelService
    {
        Task<BusinessModelDTO> GetOrCreateAsync(string id, IAuthContext authContext);
        Task<List<ChangeEvent>> GetSinceAsync(string gameId, int sinceVersionNumber, IAuthContext authContext);
        Task<Applied<ChangeEvent>> ApplyEventAsync(string gameId, IncomingChangeEvent change, IAuthContext authContext);
    }
}
