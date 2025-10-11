import joi from "joi";

function baseNumber() {
  return joi.number().required();
}

export function number(...allowedValues: number[]) {
  return allowedValues.length > 0
    ? baseNumber().valid(...allowedValues)
    : baseNumber();
}

export function optionalNumber(...values: number[]) {
  return number(...values).optional();
}
