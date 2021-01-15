using System.Collections.Generic;

namespace GDB.Business.BusinessLogic._Generic
{
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
}
