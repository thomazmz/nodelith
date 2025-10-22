import { z } from 'zod'

export const ContractList = Object.freeze({
  create(refference: `${string}List`, params: z.ZodType) {
    return z.object({
      data: z.array(params).meta({ description: `Collection of ${refference} items in the list.` })
    }).meta({ id: refference })
  }
})

export type ContractList = z.infer<ReturnType<typeof ContractList.create>>
