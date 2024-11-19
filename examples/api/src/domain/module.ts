import * as Injection from '@nodelith/container'
import * as Pet from './pets'

export const Module = new Injection.Module()
Module.useModule(Pet.PetModule)