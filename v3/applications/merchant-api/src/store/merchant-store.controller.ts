import { Http } from '@refresh/framework/http'
import { Controller } from '@refresh/framework/controller'
import { StoreService } from '@refresh/domain/store'
import { MerchantStoreDto } from './merchant-store.contracts'
import { MerchantStoreListDto } from './merchant-store.contracts'
import { CreateMerchantStoreBody } from './merchant-store.contracts'
import { UpdateMerchantStoreBody } from './merchant-store.contracts'

@Controller.Router('/stores')
export class MerchantStoreController {
  public constructor(
    private readonly storeService: StoreService
  ) {}

  @Controller.Path('/')
  @Controller.Method(Http.Method.Get)
  @Controller.Success(Http.Status.Ok)
  public async getStores(): Promise<MerchantStoreListDto> {
    const stores = await this.storeService.getStores()
    return MerchantStoreListDto.create(stores)
  }

  @Controller.Path('/:id')
  @Controller.Method(Http.Method.Get)
  @Controller.Success(Http.Status.Ok)
  public async getStore(id: string): Promise<MerchantStoreDto> {
    const store = await this.storeService.getStore(id)
    return MerchantStoreDto.create(store)
  }

  @Controller.Path('/')
  @Controller.Method(Http.Method.Post)
  @Controller.Success(Http.Status.Created)
  @Controller.Body(CreateMerchantStoreBody)
  public async createStore(body: CreateMerchantStoreBody): Promise<MerchantStoreDto> {
    const store = await this.storeService.createStore(body)
    return MerchantStoreDto.create(store)
  }

  @Controller.Path('/:id')
  @Controller.Method(Http.Method.Patch)
  @Controller.Success(Http.Status.Ok)
  @Controller.Body(UpdateMerchantStoreBody)
  public async updateStore(id: string, body: UpdateMerchantStoreBody): Promise<MerchantStoreDto> {
    const store = await this.storeService.updateStore(id, {
      name: body.name,
      slug: body.slug,
    })
    return MerchantStoreDto.create(store)
  }

  @Controller.Path('/:id')
  @Controller.Method(Http.Method.Delete)
  @Controller.Success(Http.Status.NoContent)
  public async deleteStore(id: string): Promise<void> {
    await this.storeService.deleteStore(id)
  }
}