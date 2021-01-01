using GDB.Common.DTOs.BusinessModel;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic
{
    public class BusinessModelStore
    {
        private Dictionary<string, List<BusinessModelChangeEvent>> _cache;
        private LockObject _curLock = null;

        public BusinessModelStore()
        {
            _cache = new Dictionary<string, List<BusinessModelChangeEvent>>();
        }

        public async Task<LockObject> GetLockAsync()
        {
            var cancellation = new CancellationTokenSource();
            cancellation.CancelAfter(TimeSpan.FromSeconds(10));
            do
            {
                if (_curLock == null)
                {
                    _curLock = new LockObject(() => _curLock = null);
                    return _curLock;
                }
                await Task.Delay(32, cancellation.Token);
            } while (_curLock != null && !cancellation.Token.IsCancellationRequested);
            throw new LockTimeoutException("Could not get a lock");
        }

        public bool ContainsEventsFor(string globalId)
        {
            return _cache.ContainsKey(globalId);
        }

        public List<BusinessModelChangeEvent> GetEventsFor(string globalId)
        {
            return _cache[globalId];
        }

        public void CacheEvents(string globalId, List<BusinessModelChangeEvent> events)
        {
            if (!_cache.ContainsKey(globalId))
            {
                _cache.Add(globalId, events);
            }
            else
            {
                _cache[globalId] = events;
            }

        }
    }
}
