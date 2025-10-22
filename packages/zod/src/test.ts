import z from 'zod'

const ContractBooleanSymbol = Symbol('ContractBoolean')

type ContractBoolean = z.core.$ZodBranded<z.ZodBoolean, typeof ContractBooleanSymbol>

const ContractStringSymbol = Symbol('ContractString')

type ContractString = z.core.$ZodBranded<z.ZodString | z.ZodOptional<z.ZodString>, typeof ContractStringSymbol>

const ContractNumberSymbol = Symbol('ContractNumber')

type ContractNumber = z.core.$ZodBranded<z.ZodNumber, typeof ContractNumberSymbol>

const ContractNullSymbol = Symbol('ContractNull')

type ContractNull = z.core.$ZodBranded<z.ZodNull, typeof ContractNullSymbol>

const ContractObjectSymbol = Symbol('ContractNull')

type ContractObject<T extends z.ZodRawShape = z.ZodRawShape> = z.core.$ZodBranded<z.ZodObject<T>, typeof ContractObjectSymbol>

const ContractArraySymbol = Symbol('ContractNull')

type ContractArray<T extends ContractItem = ContractItem> = z.core.$ZodBranded<z.ZodArray<T>, typeof ContractArraySymbol>

type ContractItem = (
  | ContractBoolean
  | ContractString
  | ContractNumber
  | ContractObject
  | ContractNull
)

type ContractShape = {
  [k: string]: (
    | ContractBoolean
    | ContractString
    | ContractNumber
    | ContractObject
    | ContractNull
  )
}

type ContractMetadata<T> = {
  description: string
  example: T
}

export const Contract = Object.freeze({
  object<T extends z.ZodRawShape & ContractShape>(ref: string, params: T): ContractObject<T> {
    return z.object(params).meta({ id: ref }).brand<typeof ContractObjectSymbol>()
  },
  array<T extends ContractItem>(ref: string, params: T): ContractArray<T> {
    return z.array(params).meta({ id: ref }).brand<typeof ContractArraySymbol>()
  },
  null(metadata: ContractMetadata<null>): ContractNull {
    return z.null().meta(metadata).brand<typeof ContractNullSymbol>()
  },
  string(metadata: ContractMetadata<string>): ContractString {
    return z.string().meta(metadata).brand<typeof ContractStringSymbol>()
  },
  number(metadata: ContractMetadata<number>): ContractNumber {
    return z.number().meta(metadata).brand<typeof ContractNumberSymbol>()
  },
  boolean(metadata: ContractMetadata<boolean>): ContractBoolean {
    return z.boolean().meta(metadata).brand<typeof ContractBooleanSymbol>()
  },
})

const SomeContract = Contract.string({
  description: 'd',
  example: '',
})

const InfluencerDto = Contract.object('InfluencerDto', {
  some: SomeContract,
  name: Contract.string({
    description: 'The influencer\'s name',
    example: 'Joana'
  })
})

const CampaignDto = Contract.object('CampaignDto', {
  influencer: InfluencerDto,
  // participants: Contract.array(InfluencerDto),
  name: Contract.string({
    description: 'User name',
    example: 'John'
  }),
  age: Contract.number({
    description: 'User age',
    example: 25
  }),
})

export type CampaignDto = z.infer<typeof CampaignDto>
