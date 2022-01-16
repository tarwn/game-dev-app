import { OperationType, ValueType } from "./types";
import type { Identified, IEvent, IEventOperation, IEventStore, IIdentifiedPrimitive, Versioned } from "./types";

type IdentifiedValueUpdate<T> = Identified & { value: T };

export const operations = {
  makeObject: (parentId: string, objectId: string): IEventOperation => ({
    action: OperationType.MakeObject, $type: ValueType.object, objectId, parentId, insert: true
  }),
  makeList: (parentId: string, objectId: string, field?: string): IEventOperation => ({
    action: OperationType.MakeList, $type: ValueType.list, objectId, parentId, field
  }),
  set: (parentId: string, objectId: string, valueType: ValueType, value: string | number | boolean, field?: string): IEventOperation => ({
    action: OperationType.Set, $type: valueType, objectId, parentId, field, value
  })
};

export const primitiveEventFactory = {
  update: {
    makeGet: <TModel extends Versioned>(eventName: string, valueType: ValueType, eventStore: IEventStore<TModel>) => {
      return ({ parentId, globalId, value }: IdentifiedValueUpdate<string>): IEvent<TModel> => {
        return eventStore.createEvent(() => ({
          type: eventName,
          operations: [
            { action: OperationType.Set, $type: valueType, objectId: globalId, parentId, value }
          ]
        }));
      };
    },
    makeApply: <TModel extends Versioned, T>(getPrimitive: (model: TModel, event: IEvent<TModel>) => IIdentifiedPrimitive<T>) => {
      return (model: TModel, event: IEvent<TModel>): void => {
        const primitive = getPrimitive(model, event);
        if (primitive == null) return;
        primitive.value = event.operations[0].value;
      };
    }
  }
};
