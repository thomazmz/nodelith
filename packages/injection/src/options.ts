

export const Mode = ['spread', 'bundle']

export const Access = ['public', 'private'] as const

export const Lifetime = ['transient', 'singleton'] as const

export type Mode = typeof Mode[number]

export type Access = typeof Access[number]

export type Lifetime = typeof Lifetime[number]

export type ModeOptions = { mode?: Mode | undefined }

export type AccessOptions = { access?: Access | undefined }

export type LifetimeOptions = { lifetime?: Lifetime | undefined }

export type StaticOptions = AccessOptions

export type ResolverOptions = AccessOptions & LifetimeOptions & ModeOptions

export type ConstructorOptions = AccessOptions & LifetimeOptions & ModeOptions

export type FactoryOptions = AccessOptions & LifetimeOptions& ModeOptions