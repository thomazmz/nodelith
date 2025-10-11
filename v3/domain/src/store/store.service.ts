import { StoreRepository } from './store.repository'
import { StoreConfig } from './store.config'
import { StoreEntity } from './store.domain'

export class StoreService {
  public constructor(
    private readonly storeRepository: StoreRepository,
    private readonly storeConfig: StoreConfig,
  ) {}

  public getStores(): Promise<StoreEntity[]> {
    return this.storeRepository.getAll()
  }

  public getStore(id: string): Promise<StoreEntity> {
    return this.storeRepository.getById(id)
  }

  public deleteStore(id: string): Promise<void> {
    return this.storeRepository.delete(id)
  }

  public createStore(parameters: {
    name: string,
    slug: string,
  }): Promise<StoreEntity> {
    return this.storeRepository.create({
      name: parameters.name ?? this.storeConfig.defaultName,
      slug: parameters.slug ?? this.storeConfig.defaultSlug,
    })
  }

  public updateStore(id: string, parameters: {
    name?: string,
    slug?: string,
  }): Promise<StoreEntity> {
    return this.storeRepository.update(id, {
      name: parameters.name,
      slug: parameters.slug,
    })
  }
}
