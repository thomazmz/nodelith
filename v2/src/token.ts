export type StringToken = string

export type BrandedToken<T = any> = string & { __brand: T }

export type Token<T = any> = BrandedToken<T> | StringToken