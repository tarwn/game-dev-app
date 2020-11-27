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
        private Dictionary<string, int> _globalSeqNos;

        public TemporaryBusinessModelStore()
        {
            _models = new Dictionary<string, BusinessModelDTO>();
            _events = new Dictionary<string, List<BusinessModelChangeEvent>>();
            _globalSeqNos = new Dictionary<string, int>();
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

        public int? GetLatestSeqNo(LockObject curLock, string actor)
        {
            VerifyLock(curLock);
            if (_globalSeqNos.ContainsKey(actor))
            {
                return _globalSeqNos[actor];
            }
            else
            {
                return null;
            }
        }

        public BusinessModelDTO Create(LockObject curLock, string gameId)
        {
            VerifyLock(curLock);
            var modelId = gameId + "-1";
            _models.Add(modelId, new BusinessModelDTO(gameId, modelId));
            _events.Add(modelId, new List<BusinessModelChangeEvent>() {
                new BusinessModelChangeEvent("Init", 1, "Create", 1, 0)
            });
            return _models[gameId + "-1"];
        }

        public Applied<BusinessModelChangeEvent> ApplyChange(LockObject curLock, string gameId, IncomingBusinessModelChangeEvent change)
        {
            VerifyLock(curLock);
            var model = GetByGameId(curLock, gameId);
            if (model == null)
            {
                throw new BusinessModelNotFoundException(gameId);
            }
            // TODO conflict detect + resolution

            switch (change.Type)
            {
                case "AddNewCustomer":
                    EnsureOperationCount(change, 3);
                    model.Customers.Add(new FreeFormCollection()
                    {
                        GlobalId = change.Operations[0].ObjectId,
                        Name = change.Operations[1].Value.ToString(),
                        Entries = new List<FreeFormEntry>()
                    });
                    break;
                case "DeleteCustomer":
                    EnsureOperationCount(change, 1);
                    model.Customers.RemoveAll(c => c.GlobalId == change.Operations[0].ObjectId);
                    break;
                case "AddCustomerEntry":
                    EnsureOperationCount(change, 1);
                    model.Customers.Add(new FreeFormCollection()
                    {
                        GlobalId = change.Operations[0].ObjectId,
                        Name = change.Operations[1].Value.ToString(),
                        Entries = new List<FreeFormEntry>()
                    });
                    break;
                default:
                    throw new ArgumentException($"Unexpected event type: {change.Type}", nameof(change));
            }
            model.VersionNumber += 1;
            var newEvent = new BusinessModelChangeEvent(model.VersionNumber, change);
            _events[model.GlobalId].Add(newEvent);
            _globalSeqNos[change.Actor] = change.SeqNo + change.Operations.Count;
            return new Applied<BusinessModelChangeEvent>()
            {
                PreviousVersionNumber = change.PreviousVersionNumber,
                VersionNumber = model.VersionNumber,
                Event = newEvent
            };
        }

        private void EnsureOperationCount(IncomingBusinessModelChangeEvent change, int expectedCount)
        {
            if (change.Operations.Count != expectedCount)
            {
                throw new ArgumentException($"Operation count is expected to be {expectedCount} for {change.Type}", nameof(change));
            }
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