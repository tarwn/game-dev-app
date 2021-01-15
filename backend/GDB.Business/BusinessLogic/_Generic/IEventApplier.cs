using GDB.Common.DTOs._Events;
using GDB.Common.DTOs.Interfaces;

namespace GDB.Business.BusinessLogic._Generic
{
    public interface IEventApplier {
        string ObjectType { get; }
        string GetRootId(string gameId);
    }

    public interface IEventApplier<TDTO> : IEventApplier
        where TDTO : IIdentifiedTopObject
    {
        ChangeEvent GetCreateEvent(string gameId);
        void ApplyEvent(EventStore<TDTO, ChangeEvent> modelStore, ChangeEvent change);
    }
}