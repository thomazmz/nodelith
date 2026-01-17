import { InjectionModule } from '@nodelith/injection'

import { PetService } from './pet.service'

export const PetModule = InjectionModule.create()
PetModule.mapClassRegistration('petService', PetService)
