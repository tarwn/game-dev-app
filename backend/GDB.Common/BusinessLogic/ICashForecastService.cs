using GDB.Common.Context;
using GDB.Common.DTOs._Events;
using GDB.Common.DTOs.CashForecast;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.BusinessLogic
{
    public interface ICashForecastService
    {
        Task<CashForecastDTO> GetOrCreateAsync(string gameId, IAuthContext authContext);
        Task<List<ChangeEvent>> GetSinceAsync(string gameId, int sinceVersionNumber, IAuthContext authContext);
        Task<Applied<ChangeEvent>> ApplyEventAsync(string gameId, IncomingChangeEvent change, IAuthContext authContext);
    }
}
