import { z } from 'zod'

export const ContractSlice = Object.freeze({
  create(refference: `${string}Slice`, params: z.ZodType) {
    return z.object({
      data: z.array(params).meta({ description: `Collection of ${refference} items in the slice.` }),
      next: z.number().positive().meta({ description: `Cursor pointing to the next ${refference} in the result set.` }),
      current: z.number().positive().meta({ description: `Cursor indicating the current ${refference} in the result set.` }),
      previous: z.number().positive().meta({ description: `Cursor pointing to the previous ${refference} in the result set.` }),
    }).meta({ id: refference })
  }
})

export type ContractSlice = z.infer<ReturnType<typeof ContractSlice.create>>
