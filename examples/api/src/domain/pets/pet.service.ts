import { PetRepository } from './pet.repository'
import { Pet, PetProperties } from './pet.entity'

export class PetService {
  private readonly petRepository: PetRepository

  public constructor(dependencies: { petRepository: PetRepository }) {
    this.petRepository = dependencies.petRepository
  }

  public findPets(): Promise<Pet[]> {
    return this.petRepository.getAll()
  }

  public findPetById(id: string): Promise<Pet | undefined> {
    return this.petRepository.getById(id)
  }

  public createPet(properties: PetProperties): Promise<Pet> {
    return this.petRepository.createOne(properties)
  }
}