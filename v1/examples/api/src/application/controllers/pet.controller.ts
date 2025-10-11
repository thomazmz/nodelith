import * as Controller from '@nodelith/controller'
import * as Http from '@nodelith/http'

import { Pet, PetService } from '../../domain'

@Controller.Path('/pets')
export class PetController {
  private readonly petService: PetService

  public constructor(dependencies: { petService: PetService }) {
    this.petService = dependencies.petService
  }

  @Controller.Get('/')
  public findPets(): Promise<Pet[]> {
    return this.petService.findPets()
  }

  @Controller.Get('/:id')
  public async getPetById(id: string): Promise<Pet> {
    const pet = await this.petService.findPetById(id)

    if(!pet) {
      throw new Http.NotFoundError(`Could not find a matching Pet instance for ID "${id}".`)
    }

    return pet
  }
}
