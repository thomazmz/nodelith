import * as Crypto from 'crypto'

/**
 * Internal symbol key used to store an identity on an object.
 *
 * - Using a Symbol avoids name collisions with string keys.
 * - The property is defined as non-enumerable, non-writable, and non-configurable
 *   (see {@link Identity.set}), so it will not show up in JSON serialization or
 *   typical key iteration.
 */
const IDENTITY_KEY = Symbol.for('@nodelith/identity')

/**
 * Base62 alphabet used to encode an identity into a compact string.
 *
 * Ordering matters:
 * - indices 0-9  => '0'..'9'
 * - indices 10-35 => 'A'..'Z'
 * - indices 36-61 => 'a'..'z'
 */
const IDENTITY_CHARACTERS = Object.freeze([
  '0', '1', '2', '3', '4', '5', '6', '7', '8', '9',
  'A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J', 'K', 'L', 'M',
  'N', 'O', 'P', 'Q', 'R', 'S', 'T', 'U', 'V', 'W', 'X', 'Y', 'Z',
  'a', 'b', 'c', 'd', 'e', 'f', 'g', 'h', 'i', 'j', 'k', 'l', 'm',
  'n', 'o', 'p', 'q', 'r', 's', 't', 'u', 'v', 'w', 'x', 'y', 'z',
] as const)

/**
 * A branded string representing an object's identity.
 */
export type Identity = string & {
  readonly brand: unique symbol
}

/**
 * Namespace for supplemental Identity types.
 */
export declare namespace Identity {
  /**
   * The internal Symbol key type used to store an identity.
   */
  export type Key = typeof IDENTITY_KEY

  /**
   * A single Base62 character.
   */
  export type Character = (typeof IDENTITY_CHARACTERS)[number]

  /**
   * Convenience wrapper type for objects that are known to carry an identity.
   */
  export type Wrapper<T extends object = object> = T & {
    [IDENTITY_KEY]: Identity
  }
}

export const Identity = Object.freeze({
  /**
   * Exposes the Base62 alphabet used by {@link Identity.create}.
   */
  CHARACTERS: IDENTITY_CHARACTERS,

  /**
   * Creates a new random identity.
   *
   * @returns A 22-character Base62 identity string.
   */
  create(): Identity {
    // Generate a v4 UUID for cryptographic randomness.
    const uuid = Crypto.randomUUID()

    // Remove dashes from the UUID string to obtain 32 hex chars.
    const hex = uuid.replace(/-/g, '')

    // Convert the hex string into raw bytes.
    const buffer = Buffer.from(hex, 'hex')

    // Convert the bytes into a BigInt for base conversion.
    let number = BigInt('0x' + buffer.toString('hex'))

    // Convert from base10 (BigInt) to base62 (string).
    // We build from least significant digit to most significant,
    // but prepend each digit so the final string is in the correct order.
    let base62 = ''

    while (number > 0n) {
      // Remainder in [0, 61]
      const remainder = Number(number % 62n)

      // Map remainder to a Base62 character
      const character = Identity.CHARACTERS[remainder]

      // Prepend to maintain most-significant-digit on the left
      base62 = character + base62

      // Shift right by dividing
      number /= 62n
    }

    // Fixed-length encoding: pad with '0' on the left
    return base62.padStart(22, '0') as Identity
  },

  /**
   * Extracts an identity from an object if present.
   *
   * @param target The object that may contain an identity.
   * @returns The identity if present; otherwise `undefined`.
   */
  extract(target: object): Identity | undefined {
    return Object.hasOwn(target, IDENTITY_KEY)
      ? ((target as any)[IDENTITY_KEY] as Identity)
      : undefined
  },

  /**
   * Assert that a given value is a valid Identity {@link Identity}.
   *
   * @param value The value to validate.
   * @throws Error if `value` does not match the Identity format.
   * @returns true.
   */
  assert(value: unknown): value is Identity | never {
    if(typeof value !== 'string') throw new Error(
      `Could not assert identity value. Expected identity value to be of type string. Received value of type "${typeof value}" instead.`,
    )

    if (value.length !== 22) throw new Error(
      `Could not assert identity value. Identity value should be exactly 22 character long. Provided value contains ${value.length} characters.`,
    )

    if (!/^[0-9A-Za-z]{22}$/.test(value)) throw new Error(
      `Could not assert identity value. An invalid identity value was provided: "${value}"`,
    )

    return true
  },

  /**
   * Sets an identity on a target object.
   *
   * @param target The object to receive the identity.
   * @param identity The identity value to set (must match `/^[0-9A-Za-z]{22}$/`).
   * @throws Error if identity is already set to a different value, the provided identity is invalid or target is frozen.
   * @returns The identity that is now on the object.
   */
  set(target: object, identity: Identity): Identity | never {
    const currentIdentity = Identity.extract(target)

    if (currentIdentity) {
      if (currentIdentity !== identity) throw new Error(
        `Could not set identity. Target already has an identity value: ${currentIdentity}`,
      )

      return currentIdentity
    }

    // Note: `Object.isFrozen` implies non-extensible, but both checks keep intent explicit.
    if (!Object.isExtensible(target) || Object.isFrozen(target)) throw new Error(
      'Could not set identity. Target object is non extensible.'
    )

    Object.defineProperty(target, IDENTITY_KEY, {
      value: Identity.assert(identity) && identity,
      configurable: false,
      enumerable: false,
      writable: false,
    })

    return identity
  },

  /**
   * Creates a new identity and assigns it to the target object.
   *
   * @param target The object to assign a new identity to.
   * @throws Error under the same conditions as {@link Identity.set}.
   * @returns The newly created identity.
   */
  assign(target: object): Identity | never {
    const identity = Identity.create()
    Identity.set(target, identity)
    return identity
  },

  /**
   * Obtains the identity for an object:
   *
   * @param target The object to read/assign an identity from/to.
   * @throws Error under the same conditions as {@link Identity.assign}/{@link Identity.set}.
   * @returns The existing or newly assigned identity.
   */
  obtain(target: object): Identity | never {
    const currentIdentity = Identity.extract(target)
    return currentIdentity ?? Identity.assign(target)
  },

  /**
   * Binds the identity from a source object to a target object.
   *
   * @typeParam T The target object type.
   * @param source The source object whose identity will be used.
   * @param target The target object that will receive the same identity.
   * @throws Error if the target already has an identity, or if the target cannot be mutated (see {@link Identity.set}).
   * @returns The target object (now identity-bound to the source).
   */
  bind<T extends object = any>(source: object, target: T): T {
    if (Identity.extract(target)) {
      throw new Error(
        `Could not bind identity. Target already has an identity value.`,
      )
    }

    const sourceIdentity = Identity.obtain(source)
    Identity.set(target, sourceIdentity)
    return target
  },
})
