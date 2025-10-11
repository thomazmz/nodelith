import { Utils } from '@refresh/framework/utils'
import { ContractObject } from './contract-object';

export class ContractOutput<E = undefined> extends ContractObject {
  declare protected readonly _entries: E

  public static create<T extends Utils.Constructor>(this: T, ...argumentz: Utils.Constructor.Parameters<T>): InstanceType<T> {
    return new this(...argumentz) as InstanceType<T>
  }

  public constructor(entries: E) {
    super()
    Object.defineProperty(this, '_entries', {
      value: Object.freeze(entries),
      writable: false,
      enumerable: false,
      configurable: false,
    })
  }
}
