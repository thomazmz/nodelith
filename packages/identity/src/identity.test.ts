import { Identity } from '../src/identity'

describe('Identity', () => {

  test('Identity.CHARACTERS is frozen array', () => {
    expect(Array.isArray(Identity.CHARACTERS)).toBe(true)
    expect(Object.isFrozen(Identity.CHARACTERS)).toBe(true)
  })

  test('Identity.CHARACTERS is 62 characters long', () => {
    expect(Identity.CHARACTERS).toHaveLength(62)
  })

  test('Identity.CHARACTERS contains unique characters', () => {
    expect([...(new Set(Identity.CHARACTERS))]).toHaveLength(Identity.CHARACTERS.length)
  })

  test('Identity.create returns a 22-char base62 string', () => {
    const identity = Identity.create()
    expect(typeof identity).toBe('string')
    expect(identity).toMatch(/^[0-9A-Za-z]{22}$/)
    expect(identity).toHaveLength(22)
  })

  test('Identity.extract returns the identity when already set', () => {
    const identity = 'a'.repeat(22) as Identity
    const object = {}

    Identity.set(object, identity)
    expect(Identity.extract(object)).toBe(identity)
  })

  test('Identity.extract returns undefined when identity is not set', () => {
    const object = {}
    expect(Identity.extract(object)).toBeUndefined()
  })

  test('Identity.set is idempotent when setting the same identity again', () => {
    const identity = 'a'.repeat(22) as Identity
    const object = {}

    const first = Identity.set(object, identity)
    const second = Identity.set(object, identity)

    expect(first).toBe(identity)
    expect(second).toBe(identity)
    expect(Identity.extract(object)).toBe(identity)
  })

  test('Identity.set throws when setting a different identity on an already-identified object', () => {
    const identity1 = 'a'.repeat(22) as Identity
    const identity2 = 'b'.repeat(22) as Identity
    const object = {}

    Identity.set(object, identity1)

    expect(() => Identity.set(object, identity2)).toThrow(
      `Could not set identity. Target already has an identity value: ${identity1}`,
    )
  })

  test('Identity.set defines a non-enumerable, non-writable, non-configurable symbol property', () => {
    const identity = 'a'.repeat(22) as Identity
    const object = { a: 1 }

    Identity.set(object, identity)

    expect(Object.keys(object)).toEqual(['a'])
    expect(JSON.stringify(object)).toBe('{"a":1}')

    const symbol = Object.getOwnPropertySymbols(object).find((s) => {
      return (object as any)[s] === identity
    })

    expect(symbol).toBeDefined()

    const desc = Object.getOwnPropertyDescriptor(object, symbol!)

    expect(desc).toBeDefined()
    expect(desc!.value).toBe(identity)
    expect(desc!.enumerable).toBe(false)
    expect(desc!.writable).toBe(false)
    expect(desc!.configurable).toBe(false)
  })

  test('Identity.set throws when target object is frozen', () => {
    const identity = 'a'.repeat(22) as Identity
    const frozen = Object.freeze({})

    expect(() => Identity.set(frozen, identity)).toThrow(
      'Could not set identity. Target object is non extensible.',
    )
  })

  test('Identity.set throws when target object is sealed', () => {
    const identity = 'a'.repeat(22) as Identity
    const sealed = Object.seal({})

    expect(() => Identity.set(sealed, identity)).toThrow(
      'Could not set identity. Target object is non extensible.',
    )
  })

  test('Identity.set throws when identity string is invalid', () => {
    const object = {}

    expect(() => Identity.set(object, 'invalid' as Identity)).toThrow(
      `Could not assert identity value. Identity value should be exactly 22 character long. Provided value contains 7 characters.`
    )
  })

  test('Identity.assign creates and sets a new identity', () => {
    const object = {}

    const identity = Identity.assign(object)
    expect(identity).toMatch(/^[0-9A-Za-z]{22}$/)
    expect(Identity.extract(object)).toBe(identity)
  })

  test('Identity.obtain returns existing identity without generating a new one', () => {
    const identity = 'a'.repeat(22) as Identity
    const object = {}

    Identity.set(object, identity)

    const obtainedIdentity = Identity.obtain(object)
    expect(obtainedIdentity).toBe(identity)
  })

  test('Identity.obtain assigns a new identity when missing', () => {
    const object = {}
    const identity = Identity.obtain(object)

    expect(identity).toMatch(/^[0-9A-Za-z]{22}$/)
    expect(Identity.extract(object)).toBe(identity)
  })


  test('Identity.bind mirrors source identity onto target', () => {
    const source = {}
    const target = {}

    Identity.bind(source, target)

    const sourceId = Identity.extract(source)
    const targetId = Identity.extract(target)

    expect(sourceId).toBeDefined()
    expect(targetId).toBeDefined()
    expect(targetId).toBe(sourceId)
  })

  test('Identity.bind does not create a new identity if source already has one', () => {
    const source = {}
    const target = {}

    const existing = 'a'.repeat(22) as Identity

    Identity.set(source, existing)

    Identity.bind(source, target)

    expect(Identity.extract(target)).toBe(existing)
  })

  test('Identity.bind throws if target already has an identity', () => {
    const source = {}
    const target = {}

    const identity = 'a'.repeat(22) as Identity

    Identity.set(target, identity)

    expect(() => Identity.bind(source, target)).toThrow(
      'Could not bind identity. Target already has an identity value.',
    )
  })

  test('Identity.assert returns true when given a valid 22-char base62 string', () => {
    const identity = 'a'.repeat(22) as Identity
    expect(Identity.assert(identity)).toBe(true)
  })

  test('Identity.assert throws when not given a string', () => {
    expect(() => Identity.assert(null as any)).toThrow(
      'Could not assert identity value. Expected identity value to be of type string. Received value of type "object" instead.'
    )
  })

  test('Identity.assert throws when string is too small', () => {
    const length = 21
    const invalidIdentity = 'a'.repeat(length)
    expect(() => Identity.assert(invalidIdentity)).toThrow(
      `Could not assert identity value. Identity value should be exactly 22 character long. Provided value contains ${length} characters.`
    )
  })

  test('Identity.assert throws when string is too long', () => {
    const length = 23
    const invalidIdentity = 'a'.repeat(length)
    expect(() => Identity.assert(invalidIdentity)).toThrow(
      `Could not assert identity value. Identity value should be exactly 22 character long. Provided value contains ${length} characters.`
    )
  })

  test('Identity.assert throws when string contains non-base62 characters', () => {
    const invalidIdentityValue = '0AaZz90AaZz90AaZz90Av_'
    expect(() => Identity.assert(invalidIdentityValue)).toThrow(
      `Could not assert identity value. An invalid identity value was provided: "${invalidIdentityValue}"`,
    )
  })

  test('Identity.assert accepts mixed base62 characters', () => {
    const validIdentityValue = '0AaZz90AaZz90AaZz90Av3'
    expect(Identity.assert(validIdentityValue)).toBe(true)
  })
})