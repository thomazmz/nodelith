export type DeepRecord<Key extends string | keyof string, Value> = {
  [key in Key]: Value | DeepRecord<Key, Value>
}

