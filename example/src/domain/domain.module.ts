import { InjectionModule } from '@nodelith/injection'

import { PetModule } from './pet/pet.module'

export const DomainModule = InjectionModule.create()

DomainModule.useModule(PetModule)
