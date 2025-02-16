export const Access = [
  'private',  // Available only inside the module itself.
  'internal', // Available inside the module itself and from downstream modules.
  'external', // Available inside the module itself and from a closed parent module.
  'public',   // Available inside the module itself, from downstream modules, and from a closed parent module.
] as const

export type Access = typeof Access[number]