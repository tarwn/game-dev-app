import produce from "immer";
import { createIdentifiedPrimitive, createObjectList } from "../../../testUtils/dataModel";
import { log } from "../../../utilities/logger";
import { Identified, IEvent, IEventApplier, OperationType, ValueType, Versioned } from "./types";

type MutableEventReducer<T extends Versioned> = (model: T, event: IEvent<T>) => void;

export function createImmutableEventApplier<T extends Versioned>(eventHandlers: { [key: string]: MutableEventReducer<T> }): IEventApplier<T> {
  return {
    apply: (model: T, event: IEvent<T>) => {
      log(`Apply(${event.type}):Before`, { event, model });
      if (!eventHandlers[event.type]) {
        throw new Error(`IEventApplier<T>: Unrecognized event type ${event.type}, cannot continue`);
      }
      const nextState = produce(model, draftState => {
        eventHandlers[event.type](draftState as T, event);
        draftState.versionNumber = event.versionNumber || model.versionNumber;
      });
      // log(`Apply(${event.type}):After`, { nextState });
      return nextState;
    }
  };
}

export function createImmutableAutomaticEventApplier<T extends Versioned & Identified>(): IEventApplier<T> {
  return {
    apply: (model: T, event: IEvent<T>) => {
      // log(`Apply(${event.type}):Before`, { event, model });
      const nextState = produce(model, draftState => {
        // cache locally created object
        event.operations.forEach(o => {
          // 1. update prop (object or list)
          if (o.action == OperationType.Set && !o.insert) {
            const propToUpdate = search(draftState, { parentId: o.parentId, globalId: o.objectId });
            if (!propToUpdate)
              return; // object doesn't exist anymore (bad update or potentially deleted)

            if (!isIdentifiedPrimitive(propToUpdate)) {
              throw new Error("Cannot update a list/object as a primitive");
            }

            propToUpdate.value = parseValue(o.value, o.$type);
          }
          // 2. insert prop to object
          // 3. insert prop to list
          else if (o.action == OperationType.Set && o.insert) {
            const parentToInsertProp = searchParent(draftState, o.parentId);
            if (!parentToInsertProp)
              return; // parent doesn't exist anymore

            if (isIdentifiedPrimitive(parentToInsertProp)) {
              throw new Error("Cannot insert onto a primitive");
            }

            if (isIdentifiedArray(parentToInsertProp)) {
              const alreadyInsertedIntoArray = parentToInsertProp.list.find(l => l.globalId === o.objectId);
              if (alreadyInsertedIntoArray) {
                // ??
                // TODO - actual conflict resolution - ensure greater actor/seqNo wins
                return;
              }
              else {
                parentToInsertProp.list.push(createIdentifiedPrimitive<any>(o.parentId, o.objectId, parseValue(o.value, o.$type), o.field));
              }
              return;
            }
            else {
              if (!o.field) {
                throw new Error("Cannot apply prop insert to object: the field name is not set on the operation");
              }
              if (parentToInsertProp[o.field]) {
                if (parentToInsertProp[o.field].globalId === o.objectId) {
                  parentToInsertProp[o.field].value = o.value;
                }
                else {
                  // conflict - can't insert field, someone already did (different id)
                  // TODO - actual conflict resolution - ensure greater actor/seqNo wins
                }
                return;
              }
              // insert
              parentToInsertProp[o.field] = createIdentifiedPrimitive<Identified & any>(o.parentId, o.objectId, parseValue(o.value, o.$type), o.field);
            }
          }
          // 4. delete prop from object
          // 5. delete prop from list
          // 6. delete list on object
          // 7. delete object on object
          else if (o.action == OperationType.Delete) {
            const parentToDeleteFrom = searchParent(draftState, o.parentId);
            if (!parentToDeleteFrom)
              return;

            if (isIdentifiedPrimitive(parentToDeleteFrom)) {
              throw new Error("Cannot delete from a primitive");
            }

            if (isIdentifiedArray(parentToDeleteFrom)) {
              const objectToDeleteIndex = parentToDeleteFrom.list.findIndex(f => f.globalId === o.objectId);
              if (objectToDeleteIndex === -1)
                return;
              parentToDeleteFrom.list.splice(objectToDeleteIndex, 1);
              return;
            }
            else if (!o.field) {
              throw new Error(`Cannot delete a field without identifying the field in the operation: ${o.action}`);
            }
            else if (parentToDeleteFrom[o.field]?.globalId === o.objectId) {
              delete parentToDeleteFrom[o.field];
            }
          }
          // 8. create list on object
          else if (o.action === OperationType.MakeList) {
            const parentToAddListTo = searchParent(draftState, o.parentId);
            if (!parentToAddListTo)
              return;

            if (!o.field) {
              throw new Error(`Cannot 'MakeList' without identifying the field in the operation: ${o.action}`);
            }
            if (isIdentifiedArray(parentToAddListTo)) {
              throw new Error("Cannot extend arrays with 'MakeList'");
            }
            if (isIdentifiedPrimitive(parentToAddListTo)) {
              throw new Error("Cannot extend primitives with 'MakeList'");
            }

            if (parentToAddListTo[o.field]) {
              // do nothing, it's already there
              // TODO - actual conflict resolution - ensure greater actor/seqNo wins
              return;
            }
            else {
              parentToAddListTo[o.field] = createObjectList<Identified & any>(o.parentId, o.objectId, o.field);
            }
          }
          // 9. create object on object
          else if (o.action === OperationType.MakeObject) {
            const parentToAddListTo = searchParent(draftState, o.parentId);
            if (!parentToAddListTo)
              return;

            if (isIdentifiedPrimitive(parentToAddListTo)) {
              throw new Error("Cannot extend primitives with 'MakeObject'");
            }

            const newObject = {
              parentId: o.parentId,
              globalId: o.objectId,
              field: o.field
            };

            if (isIdentifiedArray(parentToAddListTo)) {
              const objectAlreadyInList = search(parentToAddListTo, { parentId: o.parentId, globalId: o.objectId });
              if (objectAlreadyInList) {
                // TODO - actual conflict resolution - ensure greater actor/seqNo wins
                // skip this, it's already been inserted
                return;
              }
              else {
                parentToAddListTo.list.push(newObject);
              }
            }
            else {
              if (!o.field) {
                throw new Error(`Cannot 'MakeObject' on an object without identifying the field in the operation: ${o.action}`);
              }

              if (parentToAddListTo[o.field]) {
                // TODO - actual conflict resolution - ensure greater actor/seqNo wins
                // skip this, it's already been inserted
                return;
              }
              else {
                parentToAddListTo[o.field] = newObject;
              }
            }
          }
        });

        draftState.versionNumber = event.versionNumber || model.versionNumber;
      });
      // log(`Apply(${event.type}):After`, { nextState });
      return nextState;
    }
  };
}

function parseValue(value: any, valueType: ValueType) {
  switch (valueType) {
    case ValueType.boolean:
      return !!value;
    case ValueType.date:
    case ValueType.time:
      return new Date(value);
    case ValueType.decimal:
      return Number(value);
    case ValueType.integer:
      return Math.round(Number(value));
    case ValueType.list:
      return value as [];
    case ValueType.object:
      return value as Record<string, unknown>;
    case ValueType.string:
      return value?.toString();
  }
  return value;
}

function isIdentifiedArray(obj: any) {
  return obj.list && Array.isArray(obj.list);
}

function isIdentifiedPrimitive(obj: any) {
  return obj.value !== undefined;
}

function isObject(obj: any) {
  return (typeof obj === "object" || typeof obj === 'function') && (obj !== null);
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function search(obj: any, identifier: Identified): any {
  // console.log({ identifier, globalId: obj?.globalId });
  if (obj == null)
    return;

  if (isObject(obj)) {
    if (obj.globalId == identifier.globalId && obj.parentId == identifier.parentId) {
      return obj;
    }

    // const found = Object.keys(obj).find(k => isObject(obj[k]) && obj[k].globalId === identifier.globalId);
    // if (found) {
    //   return obj[found];
    // }

    const vals = Object.values(obj);
    for (let i = 0; i < vals.length; i++) {
      const child = search(vals[i], identifier);
      if (child) return child;
    }
  }
  else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const child = search(obj[i], identifier);
      if (child) return child;
    }
  }
  return null;
}

// eslint-disable-next-line @typescript-eslint/explicit-module-boundary-types
export function searchParent(obj: any, parentId: string): any {
  // console.log({ identifier, globalId: obj?.globalId });
  if (obj == null)
    return;

  if (isObject(obj)) {
    if (obj.globalId == parentId) {
      return obj;
    }

    const vals = Object.values(obj);
    for (let i = 0; i < vals.length; i++) {
      const child = searchParent(vals[i], parentId);
      if (child) return child;
    }
  }
  else if (Array.isArray(obj)) {
    for (let i = 0; i < obj.length; i++) {
      const child = searchParent(obj[i], parentId);
      if (child) return child;
    }
  }
  return null;
}



