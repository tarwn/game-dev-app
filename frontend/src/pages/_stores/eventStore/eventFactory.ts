import { Identified, IEvent, IEventStore, OperationType, ValueType, Versioned } from "./types";

interface IEventFactory<TModel extends Versioned> {
  createPropUpdate: (eventName: string, valueType: ValueType) => (<TType>(target: Identified, value: TType) => IEvent<TModel>);
  createPropInsert: (eventName: string, valueType: ValueType, field?: string) => (<TType>(parentId: string, value: TType) => IEvent<TModel>);
  createDelete: (eventName: string, valueType: ValueType, field?: string) => ((target: Identified) => IEvent<TModel>);
  createListInsert: (eventName: string, field?: string) => ((parentId: string) => IEvent<TModel>);
}

export const createAutomaticEventFactory = <TModel extends Versioned>(eventStore: IEventStore<TModel>): IEventFactory<TModel> => ({
  createPropUpdate: (eventName: string, valueType: ValueType) => {
    return <TType>({ parentId, globalId }: Identified, value: TType): IEvent<TModel> => {
      return eventStore.createEvent(() => ({
        type: eventName,
        operations: [
          { action: OperationType.Set, objectId: globalId, parentId, "$type": valueType, value }
        ]
      }));
    };
  },
  createPropInsert: (eventName: string, valueType: ValueType, field?: string) => {
    return <TType>(parentId: string, value: TType): IEvent<TModel> => {
      return eventStore.createEvent((actor: string, seqNo: number) => ({
        type: eventName,
        operations: [
          { action: OperationType.Set, objectId: `${actor}-${seqNo}`, parentId, "$type": valueType, value, field, insert: true }
        ]
      }));
    };
  },
  createDelete: (eventName: string, valueType: ValueType, field?: string) => {
    return ({ parentId, globalId }: Identified): IEvent<TModel> => {
      return eventStore.createEvent(() => ({
        type: eventName,
        operations: [
          { action: OperationType.Delete, objectId: globalId, parentId, $type: valueType, field }
        ]
      }));
    };
  },
  createListInsert: (eventName: string, field?: string) => {
    return (parentId: string): IEvent<TModel> => {
      return eventStore.createEvent((actor: string, seqNo: number) => ({
        type: eventName,
        operations: [
          { action: OperationType.MakeList, objectId: `${actor}-${seqNo}`, parentId, "$type": ValueType.list, field, insert: true }
        ]
      }));
    };
  },
});
