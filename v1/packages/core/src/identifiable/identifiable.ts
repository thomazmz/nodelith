import { Identifier } from './identifier'

export type Identifiable<I extends Identifier = string> = {
  readonly id: I
}