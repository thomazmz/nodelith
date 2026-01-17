import { Pet } from './pet.domain'

export class PetService {
  public getPetById(id: string): Promise<Pet> {
    const now = new Date()
    return Promise.resolve(Object.freeze({
      id,
      createdAt: now,
      updatedAt: now,
      name: 'Analu'
    }))
  }
}
