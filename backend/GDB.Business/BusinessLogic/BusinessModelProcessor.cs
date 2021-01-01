using GDB.Common.DTOs.BusinessModel;
using GDB.Common.DTOs.Interfaces;
using GDB.Common.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Text.Json;
using System.Threading;
using System.Threading.Tasks;

namespace GDB.Business.BusinessLogic
{
    public class BusinessModelProcessor
    {
        private IPersistence _persistence;
        private LockObject _curLock = null;
        private Dictionary<string, List<BusinessModelChangeEvent>> _cache;

        public BusinessModelProcessor(IPersistence persistence)
        {
            _persistence = persistence;
            _cache = new Dictionary<string, List<BusinessModelChangeEvent>>();
        }

        public async Task<BusinessModelDTO> GetByIdAsync(int studioId, int actualGameId, string gameId)
        {
            using (var lockObj = await GetLockAsync())
            {
                var model = await GetLatestModelAsync(studioId, actualGameId, gameId);
                return model.Model;
            }
        }

        public BusinessModelChangeEvent GetCreateBusinessModelEvent(string gameId)
        {
            return BusinessModelEventApplier.GetCreateBusinessModelEvent(gameId);
        }

        public async Task<Applied<BusinessModelChangeEvent>> AddAndApplyEventAsync(int studioId, int actualGameId, string gameId, BusinessModelChangeEvent changeEvent)
        {
            using (var lockObj = await GetLockAsync())
            {
                var model = await GetLatestModelAsync(studioId, actualGameId, gameId);
                if (model.Model == null && changeEvent.VersionNumber != 1)
                {
                    throw new BusinessModelNotFoundException(gameId);
                }
                else if (changeEvent.VersionNumber != 1)
                {
                    changeEvent.VersionNumber = model.Model.VersionNumber + 1;
                }

                await _persistence.EventStore.CreateEventAsync(studioId, actualGameId, BusinessModelEventApplier.ObjectType, changeEvent);
                ApplyEvents(gameId, new List<BusinessModelChangeEvent> { changeEvent }, model);

                //_globalSeqNos[change.Actor] = change.SeqNo + change.Operations.Count;
                return new Applied<BusinessModelChangeEvent>(gameId, changeEvent.PreviousVersionNumber, changeEvent.VersionNumber, changeEvent);
            }
        }

        private async Task<EventStore<BusinessModelDTO, BusinessModelChangeEvent>> GetLatestModelAsync(int studioId, int actualGameId, string gameId)
        {
            var busModelId = BusinessModelEventApplier.GetRootId(gameId);

            // future: load the model from cache, call since events + apply only those
            var events = new List<BusinessModelChangeEvent>();
            int since = 0;
            if (_cache.ContainsKey(busModelId))
            {
                events.AddRange(_cache[busModelId]);
                since = events.Last().VersionNumber;
            }
            var dbevents = await _persistence.EventStore.GetEventsAsync(studioId, actualGameId, BusinessModelEventApplier.ObjectType, since);
            events.AddRange(dbevents);

            var model = ApplyEvents(gameId, events);
            return model;
        }

        private async Task<LockObject> GetLockAsync()
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

        private EventStore<BusinessModelDTO, BusinessModelChangeEvent> ApplyEvents(string gameId, List<BusinessModelChangeEvent> events, EventStore<BusinessModelDTO, BusinessModelChangeEvent> model = null)
        {
            if (model == null && events.Count == 0)
            {
                return new EventStore<BusinessModelDTO, BusinessModelChangeEvent>();
            }

            if (model == null)
            {
                if (events[0].VersionNumber != 1)
                {
                    throw new Exception($"Event stream '{BusinessModelEventApplier.ObjectType}' for game {gameId} does not start with an init event, 1st event is version {events[0].VersionNumber}");
                }
                model = new EventStore<BusinessModelDTO, BusinessModelChangeEvent>();
            }

            foreach (var evt in events)
            {
                ApplyEvent(model, evt);
            }

            if (!_cache.ContainsKey(model.Model.GlobalId))
            {
                _cache.Add(model.Model.GlobalId, model.Events);
            }
            else
            {
                _cache[model.Model.GlobalId] = model.Events;
            }

            return model;
        }

        private void ApplyEvent(EventStore<BusinessModelDTO, BusinessModelChangeEvent> model, BusinessModelChangeEvent evt)
        {
            var duplicateIds = evt.Operations.Where(o => o.Insert.GetValueOrDefault(false) && model.Ids.Contains(o.ObjectId))
                                             .Select(o => o.ObjectId)
                                             .ToList();
            if (duplicateIds.Count > 0)
            {
                throw new ArgumentException($"Operation cannot insert new object with id(s) {string.Join(",", duplicateIds)}, already in use.");
            }

            // todo version check?

            BusinessModelEventApplier.ApplyEvent(model, evt);
            model.Model.VersionNumber = evt.VersionNumber;

            // track new id's for later duplicate checks
            evt.Operations.ForEach(o =>
            {
                if (o.Insert.GetValueOrDefault(false))
                    model.Ids.Add(o.ObjectId);
            });
        }


    }

    public class EventStore<TModel, TEvent>
    {
        public EventStore()
        {
            Events = new List<TEvent>();
            Model = default;
            Ids = new HashSet<string>();
        }

        //public EventStore(List<TEvent> events, TModel model)
        //{
        //    Events = events;
        //    Model = model;
        //    Ids = new Dictionary<string, object>();
        //}

        public TModel Model { get; private set; }
        public List<TEvent> Events { get; }
        public HashSet<string> Ids { get; }

        public void Init(TModel model)
        {
            Model = model;
        }
    }

    public static class BusinessModelEventApplier
    {

        public const string ObjectType = "BusinessModel";
        public const string CreateEventType = "CreateBusinessModel";

        public static string GetRootId(string gameId)
        {
            return $"{gameId}:bm";
        }

        public static BusinessModelChangeEvent GetCreateBusinessModelEvent(string gameId)
        {
            return new BusinessModelChangeEvent("System", 1, CreateEventType, 1, 0)
            {
                Operations = new List<BusinessModelEventOperation>()
                {
                    new BusinessModelEventOperation()
                    {
                        Action = OperationType.MakeObject,
                        ParentId = gameId,
                        ObjectId = GetRootId(gameId),
                        Field = "businessModel",
                        Insert = true
                    }
                }
            };
        }

        public static void ApplyEvent(EventStore<BusinessModelDTO, BusinessModelChangeEvent> modelStore, BusinessModelChangeEvent change)
        {
            var model = modelStore.Model;

            switch (change.Type)
            {
                case CreateEventType:
                    EnsureOperationCount(change, 1);
                    modelStore.Init(new BusinessModelDTO(change.Operations[0].ParentId, change.Operations[0].ObjectId));
                    break;
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
                    ApplyBasicListAdd(model, change, m => {
                        var customer = model.Customers.List.SingleOrDefault(c => c.Entries.GlobalId == change.Operations[0].ParentId);
                        if (customer != null)
                            return customer.Entries;
                        else
                            return null;
                    });
                    break;
                case "UpdateCustomerEntry":
                    ApplyBasicListUpdate(model, change, m => {
                        var customer = model.Customers.List.SingleOrDefault(c => c.Entries.GlobalId == change.Operations[0].ParentId);
                        if (customer != null)
                            return customer.Entries;
                        else
                            return null;
                    });
                    break;
                case "DeleteCustomerEntry":
                    ApplyBasicListDelete(model, change, m => {
                        var customer = model.Customers.List.SingleOrDefault(c => c.Entries.GlobalId == change.Operations[0].ParentId);
                        if (customer != null)
                            return customer.Entries;
                        else
                            return null;
                    });
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
                case "AddValuePropGenre":
                    ApplyBasicListAdd(model, change, m => model.ValueProposition.Genres);
                    break;
                case "DeleteValuePropGenre":
                    ApplyBasicListDelete(model, change, m => model.ValueProposition.Genres);
                    break;
                case "AddValuePropPlatform":
                    ApplyBasicListAdd(model, change, m => model.ValueProposition.Platforms);
                    break;
                case "DeleteValuePropPlatform":
                    ApplyBasicListDelete(model, change, m => model.ValueProposition.Platforms);
                    break;
                case "AddValuePropEntry":
                    ApplyBasicListAdd(model, change, m => model.ValueProposition.Entries);
                    break;
                case "UpdateValuePropEntry":
                    ApplyBasicListUpdate(model, change, m => model.ValueProposition.Entries);
                    break;
                case "DeleteValuePropEntry":
                    ApplyBasicListDelete(model, change, m => model.ValueProposition.Entries);
                    break;
                case "AddChannelsAwarenessEntry":
                    ApplyBasicListAdd(model, change, m => model.Channels.Awareness);
                    break;
                case "UpdateChannelsAwarenessEntry":
                    ApplyBasicListUpdate(model, change, m => model.Channels.Awareness);
                    break;
                case "DeleteChannelsAwarenessEntry":
                    ApplyBasicListDelete(model, change, m => model.Channels.Awareness);
                    break;
                case "AddChannelsConsiderationEntry":
                    ApplyBasicListAdd(model, change, m => model.Channels.Consideration);
                    break;
                case "UpdateChannelsConsiderationEntry":
                    ApplyBasicListUpdate(model, change, m => model.Channels.Consideration);
                    break;
                case "DeleteChannelsConsiderationEntry":
                    ApplyBasicListDelete(model, change, m => model.Channels.Consideration);
                    break;
                case "AddChannelsPurchaseEntry":
                    ApplyBasicListAdd(model, change, m => model.Channels.Purchase);
                    break;
                case "UpdateChannelsPurchaseEntry":
                    ApplyBasicListUpdate(model, change, m => model.Channels.Purchase);
                    break;
                case "DeleteChannelsPurchaseEntry":
                    ApplyBasicListDelete(model, change, m => model.Channels.Purchase);
                    break;
                case "AddChannelsPostPurchaseEntry":
                    ApplyBasicListAdd(model, change, m => model.Channels.PostPurchase);
                    break;
                case "UpdateChannelsPostPurchaseEntry":
                    ApplyBasicListUpdate(model, change, m => model.Channels.PostPurchase);
                    break;
                case "DeleteChannelsPostPurchaseEntry":
                    ApplyBasicListDelete(model, change, m => model.Channels.PostPurchase);
                    break;
                case "AddCustomerRelationshipsEntry":
                    ApplyBasicListAdd(model, change, m => model.CustomerRelationships.Entries);
                    break;
                case "UpdateCustomerRelationshipsEntry":
                    ApplyBasicListUpdate(model, change, m => model.CustomerRelationships.Entries);
                    break;
                case "DeleteCustomerRelationshipsEntry":
                    ApplyBasicListDelete(model, change, m => model.CustomerRelationships.Entries);
                    break;
                case "AddRevenueEntry":
                    ApplyBasicListAdd(model, change, m => model.Revenue.Entries);
                    break;
                case "UpdateRevenueEntry":
                    ApplyBasicListUpdate(model, change, m => model.Revenue.Entries);
                    break;
                case "DeleteRevenueEntry":
                    ApplyBasicListDelete(model, change, m => model.Revenue.Entries);
                    break;
                case "AddKeyResourcesEntry":
                    ApplyBasicListAdd(model, change, m => model.KeyResources.Entries);
                    break;
                case "UpdateKeyResourcesEntry":
                    ApplyBasicListUpdate(model, change, m => model.KeyResources.Entries);
                    break;
                case "DeleteKeyResourcesEntry":
                    ApplyBasicListDelete(model, change, m => model.KeyResources.Entries);
                    break;
                case "AddKeyActivitiesEntry":
                    ApplyBasicListAdd(model, change, m => model.KeyActivities.Entries);
                    break;
                case "UpdateKeyActivitiesEntry":
                    ApplyBasicListUpdate(model, change, m => model.KeyActivities.Entries);
                    break;
                case "DeleteKeyActivitiesEntry":
                    ApplyBasicListDelete(model, change, m => model.KeyActivities.Entries);
                    break;
                case "AddKeyPartnersEntry":
                    ApplyBasicListAdd(model, change, m => model.KeyPartners.Entries);
                    break;
                case "UpdateKeyPartnersEntry":
                    ApplyBasicListUpdate(model, change, m => model.KeyPartners.Entries);
                    break;
                case "DeleteKeyPartnersEntry":
                    ApplyBasicListDelete(model, change, m => model.KeyPartners.Entries);
                    break;
                case "AddCost":
                    EnsureOperationCount(change, 5);
                    model.CostStructure.List.Add(new BusinessModelCost()
                    {
                        GlobalId = change.Operations[0].ObjectId,
                        ParentId = change.Operations[0].ParentId,
                        Field = change.Operations[0].Field,
                        Type = new IdentifiedPrimitive<string>()
                        {
                            GlobalId = change.Operations[1].ObjectId,
                            ParentId = change.Operations[1].ParentId,
                            Field = change.Operations[1].Field,
                            Value = change.Operations[1].Value.ToString()
                        },
                        Summary = new IdentifiedPrimitive<string>()
                        {
                            GlobalId = change.Operations[2].ObjectId,
                            ParentId = change.Operations[2].ParentId,
                            Field = change.Operations[2].Field,
                            Value = change.Operations[2].Value.ToString()
                        },
                        IsPreLaunch = new IdentifiedPrimitive<bool>()
                        {
                            GlobalId = change.Operations[3].ObjectId,
                            ParentId = change.Operations[3].ParentId,
                            Field = change.Operations[3].Field,
                            Value = ToBoolean(change.Operations[3].Value)
                        },
                        IsPostLaunch = new IdentifiedPrimitive<bool>()
                        {
                            GlobalId = change.Operations[4].ObjectId,
                            ParentId = change.Operations[4].ParentId,
                            Field = change.Operations[4].Field,
                            Value = ToBoolean(change.Operations[4].Value)
                        },
                    });
                    break;
                case "DeleteCost":
                    EnsureOperationCount(change, 1);
                    model.CostStructure.List.RemoveAll(c => c.GlobalId == change.Operations[0].ObjectId);
                    break;
                case "UpdateCostType":
                    EnsureOperationCount(change, 1);
                    {
                        var cost = model.CostStructure.List.SingleOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                        if (cost != null)
                        {
                            cost.Type.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "UpdateCostSummary":
                    EnsureOperationCount(change, 1);
                    {
                        var cost = model.CostStructure.List.SingleOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                        if (cost != null)
                        {
                            cost.Summary.Value = change.Operations[0].Value.ToString();
                        }
                    }
                    break;
                case "UpdateCostIsPreLaunch":
                    EnsureOperationCount(change, 1);
                    {
                        var cost = model.CostStructure.List.SingleOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                        if (cost != null)
                        {
                            cost.IsPreLaunch.Value = ToBoolean(change.Operations[0].Value);
                        }
                    }
                    break;
                case "UpdateCostIsPostLaunch":
                    EnsureOperationCount(change, 1);
                    {
                        var cost = model.CostStructure.List.SingleOrDefault(c => c.GlobalId == change.Operations[0].ParentId);
                        if (cost != null)
                        {
                            cost.IsPostLaunch.Value = ToBoolean(change.Operations[0].Value);
                        }
                    }
                    break;
                default:
                    throw new ArgumentException($"Unexpected event type: {change.Type}", nameof(change));
            }
            modelStore.Events.Add(change);
        }

        private static void ApplyBasicListDelete(BusinessModelDTO model, IncomingBusinessModelChangeEvent change, Func<BusinessModelDTO, IdentifiedList<IdentifiedPrimitive<string>>> getParent)
        {
            EnsureOperationCount(change, 1);
            {
                var parent = getParent(model);
                if (parent != null)
                {
                    parent.List.RemoveAll(e => e.GlobalId == change.Operations[0].ObjectId);
                }
            }
        }

        private static void ApplyBasicListUpdate(BusinessModelDTO model, IncomingBusinessModelChangeEvent change, Func<BusinessModelDTO, IdentifiedList<IdentifiedPrimitive<string>>> getParent)
        {
            EnsureOperationCount(change, 1);
            {
                var parent = getParent(model);
                if (parent != null)
                {
                    var entry = parent.List.SingleOrDefault(e => e.GlobalId == change.Operations[0].ObjectId);
                    if (entry != null)
                    {
                        entry.Value = change.Operations[0].Value.ToString();
                    }
                }
            }
        }

        private static void ApplyBasicListAdd(BusinessModelDTO model, IncomingBusinessModelChangeEvent change, Func<BusinessModelDTO, IdentifiedList<IdentifiedPrimitive<string>>> getParent)
        {
            EnsureOperationCount(change, 1);
            {
                var parent = getParent(model);
                if (parent != null)
                {
                    parent.List.Add(new IdentifiedPrimitive<string>()
                    {
                        GlobalId = change.Operations[0].ObjectId,
                        ParentId = change.Operations[0].ParentId,
                        Field = change.Operations[0].Field,
                        Value = change.Operations[0].Value.ToString()
                    });
                }
            }
        }

        private static void EnsureOperationCount(IncomingBusinessModelChangeEvent evt, int expectedCount)
        {
            if (evt.Operations.Count != expectedCount)
            {
                throw new ArgumentException($"Operation count is expected to be {expectedCount} for {evt.Type}", nameof(evt));
            }
        }

        private static bool ToBoolean(object input)
        {
            if (input is JsonElement)
            {
                var asJson = (JsonElement)input;
                if (asJson.ValueKind == JsonValueKind.False)
                {
                    return false;
                }
                if (asJson.ValueKind == JsonValueKind.True)
                {
                    return true;
                }
            }
            return Convert.ToBoolean(input.ToString());
        }
    }
}
