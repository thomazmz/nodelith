
import { PetEntity } from './pet.domain'
import { PetConfig } from './pet.config'
import { PetRepository } from './pet.repository'

export class PetService {
  private readonly petRepository: PetRepository
  private readonly petConfig: PetConfig

  public constructor(
    petRepository: PetRepository,
    PetConfig: PetConfig,
  ) {
    this.petRepository = petRepository
    this.petConfig = PetConfig
  }

  public getPetById(id: string): Promise<PetEntity> {
    return this.petRepository.getById(id)
  }

  public createPet(properties: {
    age?: number,
    name?: string,
  }): Promise<PetEntity> {
    return this.petRepository.create({
      name: properties.name ?? this.petConfig.defaultName,
      age: properties.age ?? this.petConfig.defaultAge,
    })
  }
}
