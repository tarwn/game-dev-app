using GDB.Common.Context;
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
        Task<List<BusinessModelChangeEvent>> GetSinceAsync(string gameId, int sinceVersionNumber, IAuthContext authContext);
        Task<Applied<BusinessModelChangeEvent>> ApplyEventAsync(string gameId, IncomingBusinessModelChangeEvent change, IAuthContext authContext);
        Task<int?> GetLatestSeqNoAsync(string actor);
    }
}
