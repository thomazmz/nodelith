export type DeepReplace<T, U> = T extends object
  ? { [K in keyof T]: T[K] extends object ? DeepReplace<T[K], U> : U }
  : U
