import { CoreRepository } from '@nodelith/core';

import { PetEntity } from './pet.domain'

export interface PetRepository extends CoreRepository<PetEntity> {
  // Custom repositoty methods shold be declared here
}