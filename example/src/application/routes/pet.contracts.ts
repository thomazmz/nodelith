import { Contract } from '@nodelith/contract'

export type PetDataObject = Contract.Infer<typeof PetDataObject>

export const PetDataObject = Contract.struct({
  id: Contract.string(),
  age: Contract.number(),
  name: Contract.string(),
})

export type CreatePetRequestBody = Contract.Infer<typeof CreatePetRequestBody>

export const CreatePetRequestBody = Contract.struct({
  id: Contract.string(),
  age: Contract.number(),
  name: Contract.string(),
})
