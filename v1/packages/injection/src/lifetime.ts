export const Lifetime = ['transient', 'singleton'] as const

export type Lifetime = typeof Lifetime[number]
