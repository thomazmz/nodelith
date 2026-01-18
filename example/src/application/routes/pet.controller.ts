import { PetService } from '@nodelith/example/domain'
import { Controller } from '@nodelith/controller'
import { HttpStatus } from '@nodelith/http'
import { HttpMethod } from '@nodelith/http'

import { CreatePetRequestBody } from './pet.contracts'
import { PetDto } from './pet.contracts'

@Controller.Router('/pets')
export class PetController {
  private petService: PetService

  public constructor(petService: PetService) {
    this.petService = petService
  }

  @Controller.Path('/:id')
  @Controller.Method(HttpMethod.Get)
  @Controller.Success(HttpStatus.Ok, PetDto)
  public async getPets(): Promise<PetDto> {
    const pet = await this.petService.getPetById("someId")
    return Object.freeze({
      id: pet.id,
      age: pet.age,
      name: pet.name,
    })
  }

  @Controller.Path('/')
  @Controller.Method(HttpMethod.Post)
  @Controller.Success(HttpStatus.Created, PetDto)
  @Controller.Body(CreatePetRequestBody)
  public async createPet(body: CreatePetRequestBody): Promise<PetDto> {
    const pet = await this.petService.createPet(body)
    return Object.freeze({
      id: pet.id,
      age: pet.age,
      name: pet.name,
    })
  }
}
