using GDB.Common.DTOs.BusinessModel;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic
{
    public class TemporaryBusinessModelStore
    {
        private LockObject _curLock = null;
        private Dictionary<string, BusinessModelDTO> _models;
        private Dictionary<string, List<BusinessModelChangeEvent>> _events;

        public TemporaryBusinessModelStore()
        {
            _models = new Dictionary<string, BusinessModelDTO>();
            _events = new Dictionary<string, List<BusinessModelChangeEvent>>();
        }


        public async Task<LockObject> GetLockAsync()
        {
            var cancellation = new CancellationTokenSource();
            cancellation.CancelAfter(TimeSpan.FromSeconds(10));
            while (_curLock != null && !cancellation.Token.IsCancellationRequested)
            {
                if (_curLock == null)
                {
                    _curLock = new LockObject(() => _curLock = null);
                    return _curLock;
                }
                await Task.Delay(32, cancellation.Token);
            }
            throw new LockTimeoutException("Could not get a lock");
        }

        public void VerifyLock(LockObject curLock)
        {
            if (curLock != _curLock)
                throw new Exception("Lock mismatch for Store");
        }

        public BusinessModelDTO GetByGameId(LockObject curLock, string gameId)
        {
            VerifyLock(curLock);
            return _models.Values.SingleOrDefault(m => m.GlobalGameId == gameId);
        }

        public List<BusinessModelChangeEvent> GetByGameIdSince(LockObject curLock, string gameId, int sinceVersionNumber)
        {
            VerifyLock(curLock);
            var model = GetByGameId(curLock, gameId);
            if (model == null)
            {
                return null;
            }
            return _events[model.GlobalId]
                .Where(e => e.VersionNumber > sinceVersionNumber)
                .OrderBy(e => e.VersionNumber)
                .ToList();
        }
        public BusinessModelDTO Create(LockObject curLock, string gameId)
        {
            VerifyLock(curLock);
            var modelId = gameId + "-1";
            _models.Add(modelId, new BusinessModelDTO(gameId, modelId));
            _events.Add(modelId, new List<BusinessModelChangeEvent>() {
                new BusinessModelChangeEvent("Create", 1)
            });
            return _models[gameId + "-1"];
        }

        public Applied<BusinessModelChangeEvent> ApplyChange(LockObject curLock, string gameId, int clientPreviousVersionNumber, BusinessModelChangeEvent change)
        {
            VerifyLock(curLock);
            var model = GetByGameId(curLock, gameId);
            if (model == null)
            {
                throw new BusinessModelNotFoundException(gameId);
            }
            // YOUAREHERE!
            // Apply event to model
            // Update model
            // Add event to list
            // return Apply details
        }

    }

    public class LockObject : IDisposable
    {
        private Func<object> p;

        public LockObject(Func<object> p)
        {
            this.p = p;
        }

        public void Dispose()
        {
            p?.Invoke();
        }
    }

    public class LockTimeoutException : Exception
    {
        public LockTimeoutException(string message) : base(message) { }
    }

    public class BusinessModelNotFoundException : Exception
    {
        public BusinessModelNotFoundException(string gameId) : base($"No business model found for game id '{gameId}'")
        {
            GameId = gameId;
        }

        public string GameId { get; set; }
    }
}