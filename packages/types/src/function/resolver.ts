import * as Types from '@nodelith/types'

export type Resolver<T extends Types.Value = Types.Value> = Types.Function<T>
