import { randomUUID, UUID } from 'crypto'

const IDENTITY_ALPHABET = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz'

const IDENTITY_KEY = Symbol('identity')

export type Identity = string

/**
 * Encode a UUID identity into a fixed 22-character base62 identity.
 * @param uuid UUID identity (e.g., '7e1c22c7-5b5f-4cd3-a678-9e9d0d7613fc')
 * @returns Base62-encoded identity (e.g., '1dfvEtZ6aHG9AkY1Te7l2c')
 */
export function encodeIdentity(uuid: UUID): string {
  // Remove dashes from the UUID string to get a raw 32-character hex string.
  const hex = uuid.replace(/-/g, '')

  // Convert the hex string into a Buffer (16 bytes = 128 bits).
  const buffer = Buffer.from(hex, 'hex')

  // Convert the buffer into a BigInt for base conversion.
  let number = BigInt('0x' + buffer.toString('hex'))

  // Declare the base62 output
  let base62 = ''

  // Converts the BigInt from base 10 into base 62.
  while (number > 0n) {
    // Get remainder of division by 62
    const remainder = Number(number % 62n)

    // Get the correspondent alphabet character
    base62 = IDENTITY_ALPHABET[remainder] + base62

    // Divide the number by 62 to shift right
    number /= 62n
  }

  // Pad the result on the left with '0'
  return base62.padStart(22, '0')
}

/**
 * Decode a 22-character base62 identity back into a UUID.
 * @param encodedIdentity Base62-encoded identity (e.g., '1dfvEtZ6aHG9AkY1Te7l2c')
 * @returns A standard UUID (e.g., '7e1c22c7-5b5f-4cd3-a678-9e9d0d7613fc')
 */
export function decodeIdentity(encodedIdentity: string): string {
  // Start with a BigInt number initialized to 0.
  let number = 0n

  // For each character in the base62 string:
  for (const character of encodedIdentity) {
    // Find its numeric index in the base62 alphabet.
    const alphabetIndex = IDENTITY_ALPHABET.indexOf(character)

    // If the character is not in the base62 alphabet, throw an error.
    if (alphabetIndex === -1) {
      throw new Error(`Invalid base62 character: ${character}`)
    }

    // Multiply the current number by 62.
    // Add the numeric value of the current character.
    // This reconstructs the original number encoded in base62.
    number = number * 62n + BigInt(alphabetIndex)
  }

  // Convert the number back into a hexadecimal string.
  // Pad with leading zeroes to ensure it's exactly 128 bits (32 hex digits).
  const hex = number.toString(16).padStart(32, '0')

  // Format the hex string into standard UUID format (8-4-4-4-12).
  return [
    hex.slice(0, 8),
    hex.slice(8, 12),
    hex.slice(12, 16),
    hex.slice(16, 20),
    hex.slice(20),
  ].join('-')
}

export function createIdentity() {
  const uuid = randomUUID()
  return encodeIdentity(uuid)
}

export function bindIdentity<T extends object = any>(source: object, target: T): T {
  const identity = extractIdentity(source)

  const existing = target[IDENTITY_KEY]

  if(Object.isFrozen(target)) {
    throw new Error('Could not assign identity. Target object is frozen.')
  }

  if(!Object.isExtensible(target)) {
    throw new Error('Could not assign identity. Target object is not extensible.')
  }

  if (Object.getOwnPropertyDescriptor(target, IDENTITY_KEY)) {
    throw new Error(`Could not assign identity. Target already has an identity value: ${existing}`)
  }

  Object.defineProperty(target, IDENTITY_KEY, {
    value: identity,
    configurable: false,
    enumerable: false,
  })

  return target
}

export function extractIdentity(target: Object): Identity {

  if(Object.isFrozen(target)) {
    throw new Error('Could not assign identity. Target object is frozen.')
  }

  if(!Object.isExtensible(target)) {
    throw new Error('Could not assign identity. Target object is not extensible.')
  }

  if (!Object.getOwnPropertyDescriptor(target, IDENTITY_KEY)) {
    Object.defineProperty(target, IDENTITY_KEY, {
      value: createIdentity(),
      configurable: false,
      enumerable: false,
    })
  }
  return target[IDENTITY_KEY]
}

export namespace Identity {
  export const extract = extractIdentity
  export const create = createIdentity
  export const encode = encodeIdentity
  export const decode = decodeIdentity
  export const bind = bindIdentity
}
