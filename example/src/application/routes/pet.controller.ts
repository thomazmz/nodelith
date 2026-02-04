import { PetService } from '@nodelith/example/domain'
import { Controller } from '@nodelith/controller'
import { HttpStatus } from '@nodelith/http'
import { HttpMethod } from '@nodelith/http'
import { CreatePetRequestBody } from './pet.contracts'
import { PetDataObject } from './pet.contracts'

@Controller.Router('/pets')
export class PetController {
  private petService: PetService

  public constructor(petService: PetService) {
    this.petService = petService
  }

  @Controller.Path('/:id')
  @Controller.Method(HttpMethod.Delete)
  @Controller.RequestBody(CreatePetRequestBody)
  @Controller.SuccessResponse(HttpStatus.NoContent)
  public async deletePet(id: string): Promise<void> {
    await this.petService.deletePetById(id)
  }

  @Controller.Path('/:id')
  @Controller.Method(HttpMethod.Get)
  @Controller.SuccessResponse(HttpStatus.Ok, PetDataObject)
  public async getPets(id: string): Promise<PetDataObject> {
    const pet = await this.petService.getPetById(id)
    return Object.freeze({
      id: pet.id,
      age: pet.age,
      name: pet.name,
    })
  }

  @Controller.Path('/')
  @Controller.Method(HttpMethod.Post)
  @Controller.RequestBody(CreatePetRequestBody)
  @Controller.SuccessResponse(HttpStatus.Created, PetDataObject)
  public async createPet(body: CreatePetRequestBody): Promise<PetDataObject> {
    const pet = await this.petService.createPet(body)
    return Object.freeze({
      id: pet.id,
      age: pet.age,
      name: pet.name,
    })
  }
}
