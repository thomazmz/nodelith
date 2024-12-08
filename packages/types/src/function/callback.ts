import * as Types from '@nodelith/types'

export type Callback<Args extends any[] = any[]> = Types.Function<void, Args>
