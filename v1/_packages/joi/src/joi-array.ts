import joi from "joi";

function baseArray() {
  return joi.array().required().strict();
}

export function array(schema?: joi.Schema) {
  return schema ? baseArray().items(schema) : baseArray();
}

export function optionalArray(schema?: joi.Schema) {
  return array(schema).optional();
}
