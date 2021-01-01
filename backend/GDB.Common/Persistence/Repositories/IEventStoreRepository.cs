using GDB.Common.DTOs.BusinessModel;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Persistence.Repositories
{
    public interface IEventStoreRepository
    {
        Task<List<BusinessModelChangeEvent>> GetEventsAsync(int studioId, int gameId, string objectType, int sinceVersionNumber);
        Task CreateEventAsync(int studioId, int gameId, string objectType, BusinessModelChangeEvent changeEvent);
    }
}
