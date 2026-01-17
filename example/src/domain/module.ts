import { InjectionModule } from '@nodelith/injection'

import { PetModule } from './pet/module'

export const DomainModule = InjectionModule.create()
DomainModule.useModule(PetModule)
