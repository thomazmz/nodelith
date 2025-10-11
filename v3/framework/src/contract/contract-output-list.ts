import { Utils } from '@refresh/framework/utils'

export abstract class ContractOutputList<T> {
  static create<T extends Utils.Constructor>(this: T, ...argumenti: Utils.Constructor.Parameters<T>): InstanceType<T> {
    return new this(...argumenti) as InstanceType<T>;
  }

  public readonly data: Readonly<T[]>;

  public constructor(data: T[]) {
    this.data = Object.freeze(data);
  }
}