using GDB.Common.DTOs.BusinessModel;
using GDB.Common.DTOs.Interfaces;
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
        private Dictionary<string, HashSet<string>> _ids;
        private Dictionary<string, int> _globalSeqNos;

        public TemporaryBusinessModelStore()
        {
            _models = new Dictionary<string, BusinessModelDTO>();
            _events = new Dictionary<string, List<BusinessModelChangeEvent>>();
            _ids = new Dictionary<string, HashSet<string>>();
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
            return _models.Values.SingleOrDefault(m => m.ParentId == gameId);
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
            var modelId = gameId + ":bm";
            var model = new BusinessModelDTO(gameId, modelId);
            _models.Add(modelId, model);
            _events.Add(modelId, new List<BusinessModelChangeEvent>() {
                new BusinessModelChangeEvent("Init", 1, "CreateBusinessModel", 1, 0){
                    Operations = new List<BusinessModelEventOperation>(){
                        new BusinessModelEventOperation(){
                            Action = OperationType.MakeObject,
                            ParentId = model.ParentId,
                            ObjectId = model.GlobalId,
                            Field = model.Field,
                            Insert = true
                        }
                    }
                }
            });
            _ids.Add(modelId, new HashSet<string>() {
                model.GlobalId,
                model.ParentId
            });
            return _models[modelId];
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

            if (_ids.ContainsKey(model.GlobalId))
            {
                var duplicateId = change.Operations.FirstOrDefault(o => o.Insert.GetValueOrDefault(false) && _ids[model.GlobalId].Contains(o.ObjectId));
                if (duplicateId != null)
                {
                    throw new ArgumentException($"Operation cannot insert new object with id {duplicateId}, already in use.");
                }
            }

            switch (change.Type)
            {
                case "AddNewCustomer":
                    EnsureOperationCount(change, 4);
                    model.Customers.List.Add(new BusinessModelCustomer()
                    {
                        GlobalId = change.Operations[0].ObjectId,
                        ParentId = change.Operations[0].ParentId,
                        Field = change.Operations[0].Field,
                        Name = new IdentifiedPrimitive<string>()
                        {
                            GlobalId = change.Operations[1].ObjectId,
                            ParentId = change.Operations[1].ParentId,
                            Field = change.Operations[1].Field,
                            Value = change.Operations[1].Value.ToString()
                        },
                        Entries = new IdentifiedList<IdentifiedPrimitive<string>>()
                        {
                            GlobalId = change.Operations[2].ObjectId,
                            ParentId = change.Operations[2].ParentId,
                            Field = change.Operations[2].Field,
                            List = new List<IdentifiedPrimitive<string>>()
                        },
                        Type = new IdentifiedPrimitive<string>()
                        {
                            GlobalId = change.Operations[3].ObjectId,
                            ParentId = change.Operations[3].ParentId,
                            Field = change.Operations[3].Field,
                            Value = change.Operations[3].Value.ToString()
                        }
                    });
                    break;
                case "DeleteCustomer":
                    EnsureOperationCount(change, 1);
                    model.Customers.List.RemoveAll(c => c.GlobalId == change.Operations[0].ObjectId);
                    break;
                case "AddCustomerEntry":
                    EnsureOperationCount(change, 1);
                    {
                        var customer = model.Customers.List.SingleOrDefault(c => c.Entries.GlobalId == change.Operations[0].ParentId);
                        if (customer != null)
                        {
                            customer.Entries.List.Add(new IdentifiedPrimitive<string>()
                            {
                                GlobalId = change.Operations[0].ObjectId,
                                ParentId = change.Operations[0].ParentId,
                                Field = change.Operations[0].Field,
                                Value = change.Operations[0].Value.ToString()
                            });
                        }
                    }
                    break;
                case "UpdateCustomerEntry":
                    EnsureOperationCount(change, 1);
                    {
                        var customer = model.Customers.List.SingleOrDefault(c => c.Entries.GlobalId == change.Operations[0].ParentId);
                        if (customer != null)
                        {
                            var entry = customer.Entries.List.SingleOrDefault(e => e.GlobalId == change.Operations[0].ObjectId);
                            if (entry != null)
                            {
                                entry.Value = change.Operations[0].Value.ToString();
                            }
                        }
                    }
                    break;
                case "DeleteCustomerEntry":
                    EnsureOperationCount(change, 1);
                    {
                        var customer = model.Customers.List.SingleOrDefault(c => c.Entries.GlobalId == change.Operations[0].ParentId);
                        if (customer != null)
                        {
                            customer.Entries.List.RemoveAll(e => e.GlobalId == change.Operations[0].ObjectId);
                        }
                    }
                    break;
                case "UpdateCustomerType":
                    EnsureOperationCount(change, 1);
                    {
                        var customer = model.Customers.List.SingleOrDefault(c => c.Entries.GlobalId == change.Operations[0].ParentId);
                        if (customer != null)
                        {
                            customer.Type.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "UpdateCustomerName":
                    EnsureOperationCount(change, 1);
                    {
                        var customer = model.Customers.List.SingleOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                        if (customer != null)
                        {
                            customer.Name.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                default:
                    throw new ArgumentException($"Unexpected event type: {change.Type}", nameof(change));
            }
            model.VersionNumber += 1;
            var newEvent = new BusinessModelChangeEvent(model.VersionNumber, change);
            _events[model.GlobalId].Add(newEvent);
            newEvent.Operations.ForEach(o =>
            {
                if (o.Insert.GetValueOrDefault(false))
                    _ids[model.GlobalId].Add(o.ObjectId);
            });
            _globalSeqNos[change.Actor] = change.SeqNo + change.Operations.Count;
            return new Applied<BusinessModelChangeEvent>(gameId, change.PreviousVersionNumber, model.VersionNumber, newEvent);
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