using GDB.Common.BusinessLogic;
using GDB.Common.Context;
using GDB.Common.DTOs.BusinessModel;
using GDB.Common.Persistence;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic
{
    public class BusinessModelService : IBusinessModelService
    {
        private IBusinessServiceOperator _busOp;
        private TemporaryBusinessModelStore _store;

        public BusinessModelService(IBusinessServiceOperator busOp, TemporaryBusinessModelStore store)
        {
            _busOp = busOp;
            _store = store;
        }

        public async Task<BusinessModelDTO> GetOrCreateAsync(string gameId, IAuthContext authContext)
        {
            return await _busOp.Query(async (p) =>
            {
                using (var lockObj = await _store.GetLockAsync())
                {
                    return _store.GetByGameId(lockObj, gameId)
                        ?? _store.Create(lockObj, gameId);
                }
            });
        }

        public async Task<List<BusinessModelChangeEvent>> GetSinceAsync(string gameId, int sinceVersionNumber, IAuthContext authContext)
        {
            return await _busOp.Query(async (p) =>
            {
                using (var lockObj = await _store.GetLockAsync())
                {
                    return _store.GetByGameIdSince(lockObj, gameId, sinceVersionNumber);
                }
            });
        }


        public async Task<Applied<BusinessModelChangeEvent>> ApplyEventAsync(string gameId, IncomingBusinessModelChangeEvent change, IAuthContext authContext)
        {
            return await _busOp.Operation(async (p) =>
            {
                using (var lockObj = await _store.GetLockAsync())
                {
                    return _store.ApplyChange(lockObj, gameId, change);
                }
            });
        }

        public async Task<int?> GetLatestSeqNoAsync(string actor)
        {
            return await _busOp.Operation(async (p) =>
            {
                using (var lockObj = await _store.GetLockAsync())
                {
                    return _store.GetLatestSeqNo(lockObj, actor);
                }
            });
        }
    }
}
