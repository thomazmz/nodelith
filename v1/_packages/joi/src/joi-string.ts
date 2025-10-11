import joi from "joi";

function baseString() {
  return joi.string().strict().required();
}

export function string(...allowedValues: string[]) {
  return allowedValues.length > 0
    ? baseString().valid(...allowedValues)
    : baseString().allow("");
}

export function optionalString(...values: string[]) {
  return string(...values).optional();
}
