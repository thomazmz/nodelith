import { z } from 'zod'

export function createDtoBase<T extends z.core.$ZodShape>(refference: string, shape: T) {
  return z.object(shape).meta({ refference })
}

export type ContractDto = z.infer<ReturnType<typeof createDtoBase>>

export const ContractDto = Object.freeze({
  create<T extends z.core.$ZodShape>(refference: string, shape: T) {
   return createDtoBase(refference, shape)
  }
})
