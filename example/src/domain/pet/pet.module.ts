import { InjectionModule } from '@nodelith/injection'
import { PetConfigInitializer } from './pet.config'
import { PetService } from './pet.service'

export const PetModule = InjectionModule.create()
PetModule.mapClassInitializer('petConfig', PetConfigInitializer)
PetModule.mapClassRegistration('petService', PetService)
