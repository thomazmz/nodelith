import { ValueObject } from "@nodelith/context";
import joi from "joi";

function baseObject<T extends ValueObject>(schemaMap?: joi.SchemaMap<T>) {
  return joi.object(schemaMap).required().strict();
}

export function object<T extends ValueObject>(schemaMap?: joi.SchemaMap<T>) {
  return baseObject(schemaMap);
}

export function optionalObject<T extends ValueObject>(
  schemaMap?: joi.SchemaMap<T>
) {
  return object(schemaMap).optional();
}
