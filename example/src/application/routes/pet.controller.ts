import { PetService } from '@nodelith/example/domain'
import { Controller } from '@nodelith/controller'
import { HttpStatus } from '@nodelith/http'
import { HttpMethod } from '@nodelith/http'
import { PetDto } from './pet.contracts'

@Controller.Router('/pets')
export class PetController {
  private petService: PetService

  public constructor(petService: PetService) {
    this.petService = petService
  }

  @Controller.Path('/:id')
  @Controller.Method(HttpMethod.Get)
  @Controller.Success(HttpStatus.Ok)
  public async getPets(): Promise<PetDto> {
    const pet = await this.petService.getPetById("someId")
    return {
      id: pet.id,
      name: pet.name,
    }
  }
}
