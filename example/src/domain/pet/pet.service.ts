
import { PetEntity } from './pet.domain'
import { PetConfig } from './pet.config'
import { PetRepository } from './pet.repository'
import { CoreLogger } from '@nodelith/core'

export class PetService {
  private readonly petRepository: PetRepository
  private readonly petConfig: PetConfig

  public constructor(
    petRepository: PetRepository,
    PetConfig: PetConfig,
    logger: CoreLogger,
  ) {
    this.petRepository = petRepository
    this.petConfig = PetConfig
  }

  public deletePetById(id: string): Promise<void> {
    return this.petRepository.deleteById(id)
  }

  public getPetById(id: string): Promise<PetEntity> {
    return this.petRepository.getById(id)
  }

  public createPet(properties: {
    age: number,
    name?: string,
  }): Promise<PetEntity> {
    return this.petRepository.create({ ...properties,
      name: properties.name ?? this.petConfig.defaultName,
    })
  }
}
