export const Access = [
  'private',
  'public',
] as const

export type Access = typeof Access[number]