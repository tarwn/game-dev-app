import { Identified, IEvent, IEventOperation, IEventStore, OperationType, ValueType, Versioned, VersionEventArgs } from "./types";

interface IEventFactory<TModel extends Versioned> {
  createPropUpdate: (eventName: string, valueType: ValueType) => (<TType>(target: Identified, value: TType) => IEvent<TModel>);
  createPropInsert: (eventName: string, valueType: ValueType, field?: string) => (<TType>(parentId: string, value: TType) => IEvent<TModel>);
  createDelete: (eventName: string, valueType: ValueType, field?: string) => ((target: Identified) => IEvent<TModel>);
  createListInsert: (eventName: string, field?: string) => ((parentId: string) => IEvent<TModel>);
  createObjectInsert: (
    eventName: string,
    field?: string,
    operationBuilders?: ((prevIds: string[], newOperationId: string) => IEventOperation)[]
  ) => ((parentId: string) => IEvent<TModel>);
}

export const opsFactory = {
  updateProp: <TType>(parentId: string, globalId: string, valueType: ValueType, value: TType): IEventOperation => {
    return { action: OperationType.Set, objectId: globalId, parentId, "$type": valueType, value };
  },
  insertProp: <TType>(parentId: string, globalId: string, valueType: ValueType, value: TType, field?: string): IEventOperation => {
    return { action: OperationType.Set, objectId: globalId, parentId, "$type": valueType, value, field, insert: true };
  },
  deleteAny: (parentId: string, globalId: string, valueType: ValueType, field?: string): IEventOperation => {
    return { action: OperationType.Delete, objectId: globalId, parentId, $type: valueType, field };
  },
  insertList: (parentId: string, globalId: string, field?: string): IEventOperation => {
    return { action: OperationType.MakeList, objectId: globalId, parentId, "$type": ValueType.list, field, insert: true };
  },
  insertObject: (parentId: string, globalId: string, field?: string): IEventOperation => {
    return { action: OperationType.MakeObject, objectId: globalId, parentId, "$type": ValueType.object, field, insert: true };
  }
};

export const createAutomaticEventFactory = <TModel extends Versioned>(eventStore: IEventStore<TModel>): IEventFactory<TModel> => ({
  createPropUpdate: (eventName: string, valueType: ValueType) => {
    return <TType>({ parentId, globalId }: Identified, value: TType): IEvent<TModel> => {
      return eventStore.createEvent(() => ({
        type: eventName,
        operations: [
          opsFactory.updateProp(parentId, globalId, valueType, value)
        ]
      }));
    };
  },
  createPropInsert: (eventName: string, valueType: ValueType, field?: string) => {
    return <TType>(parentId: string, value: TType): IEvent<TModel> => {
      return eventStore.createEvent((actor: string, seqNo: number) => ({
        type: eventName,
        operations: [
          opsFactory.insertProp(parentId, `${actor}-${seqNo}`, valueType, value, field)
        ]
      }));
    };
  },
  createDelete: (eventName: string, valueType: ValueType, field?: string) => {
    return ({ parentId, globalId }: Identified): IEvent<TModel> => {
      return eventStore.createEvent(() => ({
        type: eventName,
        operations: [
          opsFactory.deleteAny(parentId, globalId, valueType, field)
        ]
      }));
    };
  },
  createListInsert: (eventName: string, field?: string) => {
    return (parentId: string): IEvent<TModel> => {
      return eventStore.createEvent((actor: string, seqNo: number) => ({
        type: eventName,
        operations: [
          opsFactory.insertList(parentId, `${actor}-${seqNo}`, field)
        ]
      }));
    };
  },
  createObjectInsert: (eventName: string, field?: string, operationBuilders?: ((prevIds: string[], newOperationId: string) => IEventOperation)[]) => {
    const ops = operationBuilders ?? [];
    return (parentId: string): IEvent<TModel> => {
      return eventStore.createEvent((actor: string, seqNo: number) => {
        const ids = [
          `${actor}-${seqNo}`
        ];
        const operations: Array<IEventOperation> = [
          opsFactory.insertObject(parentId, ids[0], field)
        ];
        ops.forEach((o, i) => {
          const nextId = `${actor}-${seqNo + i + 1}`;
          ids.push(nextId);
          operations.push(o(ids, nextId));
        }, []);
        return {
          type: eventName,
          operations
        };
      });
    };
  },
});
