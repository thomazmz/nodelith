import { Contract } from '@nodelith/contract'

export type PetDataObject = Contract.Infer<typeof PetDataObject>

export const PetDataObject = Contract.object({
  id: Contract.string(),
  age: Contract.number(),
  name: Contract.string(),
})

export type CreatePetRequestBody = Contract.Infer<typeof CreatePetRequestBody>

export const CreatePetRequestBody = Contract.object({
  id: Contract.string(),
  age: Contract.number(),
  name: Contract.string(),
})
