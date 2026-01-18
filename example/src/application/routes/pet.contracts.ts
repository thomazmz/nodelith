import { ZodContract } from '@nodelith/zod'
import { CoreContract } from '@nodelith/core'

export type PetDto = CoreContract.Infer<typeof PetDto>

export const PetDto = ZodContract.create('PetDto', {
  id: ZodContract.string({
    description: 'Unique pet identifier.',
    example: '123e4567-e89b-12d3-a456-426614174000',
  }),
  name: ZodContract.string({
    description: 'Human-friendly pet name.',
    example: 'Luna',
  }),
  age: ZodContract.number({
    description: 'Pet age in years.',
    example: 4,
  }),
})

export type CreatePetRequestBody = CoreContract.Infer<typeof CreatePetRequestBody>

export const CreatePetRequestBody = ZodContract.create('CreatePetRequestBody', {
  name: PetDto.select('name').optional(),
  age: PetDto.select('age').optional(),
})
