import joi from "joi";

function baseBoolean() {
  return joi.boolean().required();
}

export function boolean(...allowedValues: boolean[]) {
  return allowedValues.length > 0
    ? baseBoolean().valid(...allowedValues)
    : baseBoolean();
}

export function optionalBoolean(...values: boolean[]) {
  return boolean(...values).optional();
}
