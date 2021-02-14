import { Identified, IEvent, IEventOperation, IEventStore, OperationType, ValueType, Versioned } from "./types";

interface IEventFactory<TModel extends Versioned> {
  createPropUpdate: <TType>(eventName: string, valueType: ValueType) => ((target: Identified, value: TType) => IEvent<TModel>);
  createPropInsert: <TType>(
    eventName: string,
    valueType: ValueType,
    field?: string
  ) => ((parentId: string, value: TType) => IEvent<TModel>);
  createDelete: (eventName: string, valueType: ValueType, field?: string) => ((target: Identified) => IEvent<TModel>);
  createListInsert: <T extends null | any>(
    eventName: string,
    field?: string,
    operationBuilders?: ((prevIds: string[], newOperationId: string, args?: T) => IEventOperation)[]
  ) => ((parentId: string, args?: T) => IEvent<TModel>);
  createObjectInsert: <T extends null | any>(
    eventName: string,
    field?: string,
    operationBuilders?: ((prevIds: string[], newOperationId: string, args?: T) => IEventOperation)[]
  ) => ((parentId: string, args?: T) => IEvent<TModel>);
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
  createPropUpdate: <TType>(eventName: string, valueType: ValueType) => {
    return ({ parentId, globalId }: Identified, value: TType): IEvent<TModel> => {
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
  // eslint-disable-next-line max-len
  createListInsert: <T extends null | any>(eventName: string, field?: string, operationBuilders?: ((prevIds: string[], newOperationId: string, args?: T) => IEventOperation)[]) => {
    const ops = operationBuilders ?? [];
    return (parentId: string, args?: T): IEvent<TModel> => {
      return eventStore.createEvent((actor: string, seqNo: number) => {
        const ids = [
          `${actor}-${seqNo}`
        ];
        const operations: Array<IEventOperation> = [
          opsFactory.insertList(parentId, ids[0], field)
        ];
        ops.forEach((o, i) => {
          const nextId = `${actor}-${seqNo + i + 1}`;
          ids.push(nextId);
          operations.push(o(ids, nextId, args));
        }, []);
        return {
          type: eventName,
          operations
        };
      });
    };
  },
  // eslint-disable-next-line max-len
  createObjectInsert: <T extends null | any>(eventName: string, field?: string, operationBuilders?: ((prevIds: string[], newOperationId: string, args?: T) => IEventOperation)[]) => {
    const ops = operationBuilders ?? [];
    return (parentId: string, args?: T): IEvent<TModel> => {
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
          operations.push(o(ids, nextId, args));
        }, []);
        return {
          type: eventName,
          operations
        };
      });
    };
  },
});
