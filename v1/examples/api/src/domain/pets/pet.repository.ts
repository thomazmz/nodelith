import { Repository } from '@nodelith/core';
import { Pet } from './pet.entity'

export interface PetRepository extends Repository<Pet> { }