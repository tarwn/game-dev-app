using GDB.Common.DTOs._Events;
using GDB.Common.DTOs.BusinessModel;
using Microsoft.Extensions.Caching.Memory;
using System;
using System.Collections.Concurrent;
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
        private ConcurrentDictionary<string, object> _locks = new ConcurrentDictionary<string, object>();
        private Random _random;

        public ModelEventStore(IMemoryCache memoryCache)
        {
            //_cache = new Dictionary<string, List<BusinessModelChangeEvent>>();
            _memoryCache = memoryCache;
            _random = new Random();
        }

        public async Task<LockObject> GetLockAsync(string id)
        {
            var cancellation = new CancellationTokenSource();
            cancellation.CancelAfter(TimeSpan.FromSeconds(10));
            var lockObj = new LockObject(() => _locks.Remove(id, out var _));
            while (!_locks.TryAdd(id, lockObj) && !cancellation.Token.IsCancellationRequested){
                await Task.Delay((int)(32 * _random.NextDouble()), cancellation.Token);
            }
            if (cancellation.Token.IsCancellationRequested)
            {
                throw new LockTimeoutException("Could not get a lock");
            }
            return lockObj;
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
