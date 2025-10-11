import { Http } from '@refresh/framework/http'
import { Controller } from '@refresh/framework/controller'
import { StoreService } from '@refresh/domain/store'
import { CustomerStoreDto } from './customer-store.contracts'
import { CustomerStoreListDto } from './Customer-store.contracts'
import { CreateCustomerStoreBody } from './Customer-store.contracts'
import { UpdateCustomerStoreBody } from './Customer-store.contracts'

@Controller.Router('/stores')
export class CustomerStoreController {
  public constructor(
    private readonly storeService: StoreService
  ) {}

  @Controller.Path('/')
  @Controller.Method(Http.Method.Get)
  @Controller.Success(Http.Status.Ok)
  public async getStores(): Promise<CustomerStoreListDto> {
    const stores = await this.storeService.getStores()
    return CustomerStoreListDto.create(stores)
  }

  @Controller.Path('/:id')
  @Controller.Method(Http.Method.Get)
  @Controller.Success(Http.Status.Ok)
  public async getStore(id: string): Promise<CustomerStoreDto> {
    const store = await this.storeService.getStore(id)
    return CustomerStoreDto.create(store)
  }

  @Controller.Path('/')
  @Controller.Method(Http.Method.Post)
  @Controller.Success(Http.Status.Created)
  @Controller.Body(CreateCustomerStoreBody)
  public async createStore(body: CreateCustomerStoreBody): Promise<CustomerStoreDto> {
    const store = await this.storeService.createStore(body)
    return CustomerStoreDto.create(store)
  }

  @Controller.Path('/:id')
  @Controller.Method(Http.Method.Patch)
  @Controller.Success(Http.Status.Ok)
  @Controller.Body(UpdateCustomerStoreBody)
  public async updateStore(id: string, body: UpdateCustomerStoreBody): Promise<CustomerStoreDto> {
    const store = await this.storeService.updateStore(id, {
      name: body.name,
      slug: body.slug,
    })
    return CustomerStoreDto.create(store)
  }

  @Controller.Path('/:id')
  @Controller.Method(Http.Method.Delete)
  @Controller.Success(Http.Status.NoContent)
  public async deleteStore(id: string): Promise<void> {
    await this.storeService.deleteStore(id)
  }
}