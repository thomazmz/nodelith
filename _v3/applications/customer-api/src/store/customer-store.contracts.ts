import z from 'zod'
import { StoreEntity } from '@refresh/domain/store'
import { Contract } from '@refresh/framework/contract'

export class CustomerStoreDto extends Contract.Output<StoreEntity> {
  @Contract.Schema(z.string())
  public readonly id: string = this._entries.id

  @Contract.Schema(z.string())
  public readonly slug: string = this._entries.slug

  @Contract.Schema(z.string())
  public readonly name: string = this._entries.name

  @Contract.Schema(z.iso.datetime())
  public readonly createdAt: string = this._entries.createdAt.toISOString()

  @Contract.Schema(z.iso.datetime())
  public readonly updatedAt: string = this._entries.updatedAt.toISOString()
}

export class CreateCustomerStoreBody extends Contract.Input {
  @Contract.Schema(z.string())
  public readonly slug: string
  @Contract.Schema(z.string())
  public readonly name: string
}

export class UpdateCustomerStoreBody extends Contract.Input {
  @Contract.Schema(z.string().optional())
  public readonly slug?: string
  @Contract.Schema(z.string().optional())
  public readonly name?: string
}

export class CustomerStoreListDto extends Contract.OutputList<CustomerStoreDto> {
  public constructor(stores: StoreEntity[]) {
    super(stores.map(store => CustomerStoreDto.create(store)))
  }
}
