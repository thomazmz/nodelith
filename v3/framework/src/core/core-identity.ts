import * as Crypto from 'crypto'

const IDENTITY_KEY = Symbol('__identity')

export type CoreIdentity = string

export declare namespace CoreIdentity {
  export type Key = typeof IDENTITY_KEY
  
  export type Character = (typeof CoreIdentity.CHARACTERS)[number]

  export type Wrapper<T extends object = object> = T & {
    [IDENTITY_KEY]: string
  }
}

export const CoreIdentity = Object.freeze({
  CHARACTERS: Object.freeze([
    '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
    'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
    'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
    'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
    'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
  ] as const),

  create() {
    // Declare an v4 uuid for randomness.
    const uuid = Crypto.randomUUID()
  
    // Remove dashes from the UUID string.
    const hex = uuid.replace(/-/g, '')
    // Convert the string into a Buffer.
    const buffer = Buffer.from(hex, 'hex')
    // Convert the buffer into a BigInt for base conversion.
    let number = BigInt('0x' + buffer.toString('hex'))

    // Now that the original uuid string was turned into a
    // number, this while block will take care of converting
    // the obtained number from base 10 into base 62.
    let base62 = ''
    while (number > 0n) {
      // Get remainder of division by 62
      const remainder = Number(number % 62n)
      // Get the correspondent alphabet character
      const character = CoreIdentity.CHARACTERS[remainder]
      // We want the most significant digit to appear
      // on the left side of the number, thus, we should
      // append the character to the left side of the
      // base62 result.
      base62 = character + base62
      // Divide the number by 62 to shift right
      number /= 62n
    }
  
    // Pad the result on the left with '0'
    return base62.padStart(22, '0')
  },

  extract(target: object): CoreIdentity | undefined {
    return Object.hasOwn(target, IDENTITY_KEY) ? (target as any)[IDENTITY_KEY] as CoreIdentity : undefined
  },

  set(target: object, identity: CoreIdentity): CoreIdentity | never {
    const currentIdentity = CoreIdentity.extract(target)

    if(currentIdentity) {
      if(currentIdentity !== identity) {
        throw new Error(`Could not set identity. Target already has an identity value: ${currentIdentity}`)
      } 

      return currentIdentity
    }

    if(!Object.isExtensible(target) || Object.isFrozen(target)) {
      throw new Error('Could not set identity. Target object is frozen.')
    }

    if (!/^[0-9A-Za-z]{22}$/.test(identity)) {
      throw new Error(`Could not set identity. An invalid identity was provided: ${identity}`)
    }

    Object.defineProperty(target, IDENTITY_KEY, {
      value: identity,
      configurable: false,
      enumerable: false,
      writable: false,
    })

    return identity
  },

  assign(target: object): CoreIdentity | never {
    const identity = CoreIdentity.create()
    CoreIdentity.set(target, identity)
    return identity
  },

  obtain(target: object): CoreIdentity | never {
    const currentIdentity = CoreIdentity.extract(target)
    return currentIdentity ?? CoreIdentity.assign(target)
  },

  bind<T extends object = any>(source: object, target: T): T {
    if (CoreIdentity.extract(target)) {
      throw new Error(`Could not bind identity. Target already has an identity value.`)
    }

    const sourceIdentity = CoreIdentity.obtain(source)
    CoreIdentity.set(target, sourceIdentity)
    return target
  }
})
