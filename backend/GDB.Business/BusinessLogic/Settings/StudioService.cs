using GDB.Common.BusinessLogic;
using GDB.Common.Context;
using GDB.Common.DTOs.Studio;
using GDB.Common.Persistence;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic.Settings
{
    public class StudioService : IStudioService
    {
        private IBusinessServiceOperator _busOp;
        private IPersistence _persistence;

        public StudioService(IBusinessServiceOperator busOp, IPersistence persistence)
        {
            _busOp = busOp;
            _persistence = persistence;
        }

        public async Task UpdateStudioAsync(UpdateStudioDTO update, IAuthContext auth)
        {
            await _busOp.Operation(async (p) => {
                // TODO Role permission check

                var studio = await p.Studios.GetByIdAsync(auth.StudioId);
                if (!string.IsNullOrEmpty(update.Name))
                {
                    studio.Name = update.Name;
                }
                studio.UpdatedBy = auth.UserId;
                studio.UpdatedOn = DateTime.UtcNow;
                await p.Studios.UpdateAsync(studio);
            });
        }
    }
}
