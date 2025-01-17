export const Access = ['public', 'private'] as const

export type Access = typeof Access[number]