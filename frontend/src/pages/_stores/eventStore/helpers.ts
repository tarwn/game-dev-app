import type { Identified, IIdentifiedList, IIdentifiedPrimitive } from "./types";


export function createIdentifiedPrimitive<T>(parentId: string, globalId: string, value: T, field?: string): IIdentifiedPrimitive<T> {
  return {
    parentId,
    globalId,
    value,
    field
  };
}


export function createObjectList<T extends Identified>(parentId: string, globalId: string, field?: string): IIdentifiedList<T> {
  return {
    globalId,
    parentId,
    field,
    list: []
  };
}
