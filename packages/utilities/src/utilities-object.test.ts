import {
  extractMember,
  extractMembers,
  isConstructorMember,
  isFunctionMember,
} from './utilities-object'

describe('ObjectUtils', () => {
  it('extracts a single member with its key', () => {
    const obj = {
      count: 1,
      greet() { return 'hi' },
    }

    const member = extractMember(obj, 'greet')
    expect(member?.key).toBe('greet')
    expect(typeof member?.value).toBe('function')
  })

  it('extracts all own members with keys', () => {
    const obj = {
      a: 1,
      b: 2,
      say() { return 'hey' },
    }

    const members = extractMembers(obj)
    const keys = members.map((m) => m.key)
    expect(keys).toEqual(expect.arrayContaining(['a', 'b', 'say']))
  })

  it('detects function and constructor members', () => {
    class Example {
      public method() { return true }
    }

    const ctorMember = extractMember(Example.prototype as any, 'constructor')!
    const methodMember = extractMember(Example.prototype, 'method')!

    expect(isConstructorMember(ctorMember)).toBe(true)
    expect(isFunctionMember(methodMember)).toBe(true)
    expect(isConstructorMember(methodMember)).toBe(false)
  })
})
