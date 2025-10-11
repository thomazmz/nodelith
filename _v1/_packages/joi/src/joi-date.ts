import joi from "joi";

function baseDate() {
  return joi.date().required();
}

export function date(...allowedValues: Date[]) {
  return allowedValues.length > 0
    ? baseDate().valid(...allowedValues)
    : baseDate();
}

export function optionalDate(...values: Date[]) {
  return date(...values).optional();
}
