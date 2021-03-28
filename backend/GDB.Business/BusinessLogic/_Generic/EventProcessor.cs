using GDB.Business.BusinessLogic.EventStore;
using GDB.Common.DTOs._Events;
using GDB.Common.DTOs.Interfaces;
using GDB.Common.Persistence;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using ValueType = GDB.Common.DTOs._Events.ValueType;

namespace GDB.Business.BusinessLogic._Generic
{
    public class EventProcessor<TDTO, TApplier>
        where TDTO : IIdentifiedTopObject
        where TApplier : IEventApplier<TDTO>
    {
        private IPersistence _persistence;
        private ModelEventStore _store;
        private TApplier _applier;

        public EventProcessor(IPersistence persistence, ModelEventStore store, TApplier applier)
        {
            _persistence = persistence;
            _store = store;
            _applier = applier;
        }

        public string ObjectType {  get { return _applier.ObjectType; } }

        public async Task<TDTO> GetByIdAsync(int studioId, int actualGameId, string gameId)
        {
            using (var lockObj = await _store.GetLockAsync())
            {
                var model = await GetLatestModelAsync(studioId, actualGameId, gameId);
                return model.Model;
            }
        }

        public ChangeEvent GetCreateEvent(string gameId)
        {
            return _applier.GetCreateEvent(gameId, DateTime.UtcNow);
        }

        public async Task<Applied<ChangeEvent>> AddAndApplyEventAsync(int studioId, int actualGameId, string gameId, ChangeEvent changeEvent)
        {
            using (var lockObj = await _store.GetLockAsync())
            {
                var model = await GetLatestModelAsync(studioId, actualGameId, gameId);
                if (model.Model == null && changeEvent.VersionNumber != 1)
                {
                    throw new NotFoundException(gameId,  "unknown");
                }
                else if (changeEvent.VersionNumber != 1)
                {
                    changeEvent.VersionNumber = model.Model.VersionNumber + 1;
                }

                await _persistence.EventStore.CreateEventAsync(studioId, actualGameId, _applier.ObjectType, changeEvent, DateTime.UtcNow);
                ApplyEvents(gameId, new List<ChangeEvent> { changeEvent }, model);

                //_globalSeqNos[change.Actor] = change.SeqNo + change.Operations.Count;
                return new Applied<ChangeEvent>(gameId, changeEvent.PreviousVersionNumber, changeEvent.VersionNumber, changeEvent);
            }
        }

        private async Task<EventStore<TDTO, ChangeEvent>> GetLatestModelAsync(int studioId, int actualGameId, string gameId)
        {
            var dtoId = _applier.GetRootId(gameId);

            // future: load the model from cache, call since events + apply only those
            var events = new List<ChangeEvent>();
            int since = 0;
            if (_store.ContainsEventsFor(dtoId))
            {
                events.AddRange(_store.GetEventsFor(dtoId));
                since = events.Last().VersionNumber;
            }
            var dbevents = await _persistence.EventStore.GetEventsAsync(studioId, actualGameId, _applier.ObjectType, since);
            events.AddRange(dbevents);

            var model = ApplyEvents(gameId, events);
            return model;
        }

        private EventStore<TDTO, ChangeEvent> ApplyEvents(string gameId, List<ChangeEvent> events, EventStore<TDTO, ChangeEvent> model = null)
        {
            if (model == null && events.Count == 0)
            {
                return new EventStore<TDTO, ChangeEvent>();
            }

            if (model == null)
            {
                if (events[0].VersionNumber != 1)
                {
                    throw new Exception($"Event stream '{_applier.ObjectType}' for game {gameId} does not start with an init event, 1st event is version {events[0].VersionNumber}");
                }
                model = new EventStore<TDTO, ChangeEvent>();
            }

            foreach (var evt in events)
            {
                ApplyEvent(model, evt);
            }

            _store.CacheEvents(model.Model.GlobalId, model.Events);

            return model;
        }

        private void ApplyEvent(EventStore<TDTO, ChangeEvent> model, ChangeEvent evt)
        {
            var duplicateIds = evt.Operations.Where(o => o.Insert.GetValueOrDefault(false) && (o.Type == ValueType.@object || o.Type == ValueType.list) && model.Ids.Contains(o.ObjectId))
                                             .Select(o => o.ObjectId)
                                             .ToList();
            if (duplicateIds.Count > 0)
            {
                throw new ArgumentException($"Operation cannot insert new object with id(s) {string.Join(",", duplicateIds)}, already in use.");
            }

            // todo version check?

            _applier.ApplyEvent(model, evt);
            model.Model.VersionNumber = evt.VersionNumber;

            // track new id's for later duplicate checks
            evt.Operations.ForEach(o =>
            {
                if (o.Insert.GetValueOrDefault(false))
                    model.Ids.Add(o.ObjectId);
            });
        }
    }
}
