using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Common.Persistence.Repositories
{
    public interface ICashForecastSnapshotRepository
    {
        Task CreateAsync(int studioId, int gameId, int versionNumber, DateTime forecastDate, DateTime advanceTime);
    }
}
