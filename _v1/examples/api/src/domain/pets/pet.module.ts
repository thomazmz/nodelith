import * as Injection from '@nodelith/container'
import { PetService } from './pet.service'

export const PetModule = new Injection.Module()
PetModule.registerConstructor('petService', PetService)
