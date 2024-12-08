

export const Access = ['public', 'private'] as const

export const Lifetime = ['transient', 'singleton'] as const

export const Injection = ['spread', 'bundle'] as const

export const Initialization = ['lazy', 'eager'] as const

export type Access = typeof Access[number]

export type Lifetime = typeof Lifetime[number]

export type Injection = typeof Injection[number]

export type Initialization = typeof Initialization[number]