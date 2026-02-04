
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

  public async deletePetById(id: string): Promise<void> {
    return this.petRepository.deleteOneById(id)
  }

  public async findPetById(id: string): Promise<PetEntity | undefined> {
    return this.petRepository.findOneById(id)
  }

  public async getPetById(id: string): Promise<PetEntity> {
    const pet = await this.findPetById(id)
    if(!pet) throw new Error('Pet not found.')
    return pet
  }

  public async createPet(properties: {
    age: number,
    name?: string,
  }): Promise<PetEntity> {
    return this.petRepository.createOne({ ...properties,
      name: properties.name ?? this.petConfig.defaultName,
    })
  }
}
