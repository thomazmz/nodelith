import { z } from 'zod'

export const ContractPage = Object.freeze({
  create(refference: `${string}Page`, params: z.ZodType) {
    return z.object({
      data: z.array(params).meta({ description: `Collection of ${refference} items in the page.` }),
      limit: z.number().positive().meta({ description: `Maximum number of items ${refference}.` }),
      offset: z.number().positive().meta({ description: `Number of items to offset the ${refference}.` }),
    }).meta({ id: refference })
  }
})

export type ContractPage = z.infer<ReturnType<typeof ContractPage.create>>
