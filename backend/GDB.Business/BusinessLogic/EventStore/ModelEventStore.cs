using GDB.Common.DTOs._Events;
using GDB.Common.DTOs.BusinessModel;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic.EventStore
{
    public class ModelEventStore
    {
        //private Dictionary<string, List<BusinessModelChangeEvent>> _cache;
        private IMemoryCache _memoryCache;
        private LockObject _curLock = null;

        public ModelEventStore(IMemoryCache memoryCache)
        {
            //_cache = new Dictionary<string, List<BusinessModelChangeEvent>>();
            _memoryCache = memoryCache;
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
            return _memoryCache.TryGetValue(globalId, out List<ChangeEvent> events);
        }

        public List<ChangeEvent> GetEventsFor(string globalId)
        {
            if (_memoryCache.TryGetValue(globalId, out List<ChangeEvent> events))
                return events;
            else
                return null;
        }

        public void CacheEvents(string globalId, List<ChangeEvent> events)
        {
            // all changes are saved almost immediately, so constant use will be fast and coming back after a break will have 
            //  a blip of longer save time on first save
            _memoryCache.Set(globalId, events, TimeSpan.FromMinutes(30));
        }
    }
}
