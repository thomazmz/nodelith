import { InjectionRegistration } from './injection-registration'
import { InjectionContext } from './injection-context'
import { InjectionBundle } from './injection-bundle'

describe('InjectionRegistration', () => {
  describe('FunctionRegistration', () => {
    it('should implicitly resolve function registration with provision:parameters', () => {
      const fn = (foo: string, bar: string) => {
        return `${foo}:${bar}`
      }

      const registration = InjectionRegistration.create({
        function: fn,
      })

      const result = registration.resolve({ 
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result).toEqual('x:y')
    })

    it('should explicitly resolve function registration with provision:parameters', () => {
      const fn = (foo: string, bar: string) => {
        return `${foo}:${bar}`
      }

      const registration = InjectionRegistration.create({
        function: fn,
        provision: 'parameters',
      })

      const result = registration.resolve({ 
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result).toEqual('x:y')
    })

    it('should explicitly resolve function registration with provision:bundle', () => {
      const fn = (bundle: InjectionBundle) => {
        return `${bundle['foo']}:${bundle['bar']}`
      }

      const registration = InjectionRegistration.create({
        function: fn,
        provision: 'bundle',
      })

      const result = registration.resolve({ 
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result).toEqual('x:y')
    })

    it('should implicitly resolve function registration with lifecycle:singleton', () => {
      const spy = jest.fn()

      const fn = (foo: string, bar: number) => {
        spy()
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({
        function: fn,
      })

      const result_a = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      const result_b = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result_a).toBe(result_b)
      expect(result_a).toEqual({ value: 'x:y' })
      expect(result_b).toEqual({ value: 'x:y' })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should explicitly resolve function registration with lifecycle:singleton', () => {
      const spy = jest.fn()

      const fn = (foo: string, bar: number) => {
        spy()
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({
        function: fn,
        lifecycle: 'singleton',
      })

      const result_a = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      const result_b = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result_a).toBe(result_b)
      expect(result_a).toEqual({ value: 'x:y' })
      expect(result_b).toEqual({ value: 'x:y' })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should explicitly resolve function registration with lifecycle:transient', () => {
      const spy = jest.fn()

      const fn = (foo: string, bar: number) => {
        spy()
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({
        function: fn,
        lifecycle: 'transient',
      })

      const result_a = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      const result_b = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result_a).not.toBe(result_b)
      expect(result_a).toEqual({ value: 'x:y' })
      expect(result_b).toEqual({ value: 'x:y' })
      expect(spy).toHaveBeenCalledTimes(2)
    })

    it('should explicitly resolve function registration with lifecycle:scoped', () => {
      const spy = jest.fn()

      const fn = (foo: string, bar: number) => {
        spy()
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({
        function: fn,
        lifecycle: 'scoped',
      })

      const context = InjectionContext.create()

      const result_a = registration.resolve({
        bundle: { foo: 'x', bar: 'y' },
        context,
      })

      const result_b = registration.resolve({
        bundle: { foo: 'x', bar: 'y' },
        context,
      })

      const result_c = registration.resolve({
        bundle: { foo: 'x', bar: 'y' },
      })

      expect(result_a).toBe(result_b)
      expect(result_a).not.toBe(result_c)
      expect(result_b).not.toBe(result_c)
      expect(result_a).toEqual({ value: 'x:y' })
      expect(result_b).toEqual({ value: 'x:y' })
      expect(result_c).toEqual({ value: 'x:y' })
      expect(spy).toHaveBeenCalledTimes(2)
    })

    it('should implicitly resolve function registration with resolution:eager', () => {
      const spy = jest.fn()

      const fn = (foo: string, bar: string) => {
        spy()
        return `${foo}:${bar}`
      }

      const registration = InjectionRegistration.create({
        function: fn,
      })

      const result = registration.resolve({ 
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result).toEqual('x:y')
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should implicitly create function registration with visibility:public', () => {
      const fn = (foo: string, bar: number) => `${foo}:${bar}`
      const registration = InjectionRegistration.create({ function: fn  })
      expect(registration.visibility).toBe('public')
    })

    it('should explicitly create function registration with visibility:public', () => {
      const fn = (foo: string, bar: number) => `${foo}:${bar}`
      const registration = InjectionRegistration.create({ function: fn, visibility: 'public' })
      expect(registration.visibility).toBe('public')
    })

    it('should explicitly create function registration with visibility:private', () => {
      const fn = (foo: string, bar: number) => `${foo}:${bar}`
      const registration = InjectionRegistration.create({ function: fn, visibility: 'private' })
      expect(registration.visibility).toBe('private')
    })
  })

  describe('ClassRegistration', () => {
    it('should implicitly resolve class registration with provision:parameters', () => {
      class Clss { 
        public readonly value: string
        public constructor(foo: string, bar: string) { 
          this.value = `${foo}:${bar}`
        }
      }

      const registration = InjectionRegistration.create({
        class: Clss,
        resolution: 'eager',
      })

      const result = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      const expected = new Clss('x', 'y')

      expect(result).toEqual(expected)
    })

    it('should explicitly resolve class registration with provision:parameters', () => {
      class Clss { 
        public readonly value: string
        public constructor(foo: string, bar: string) { 
          this.value = `${foo}:${bar}`
        }
      }

      const registration = InjectionRegistration.create({
        class: Clss,
        resolution: 'eager',
      })

      const result = registration.resolve({ 
        bundle: { foo: 'x', bar: 'y' }
      })

      const expected = new Clss('x', 'y')

      expect(result).toEqual(expected)
    })

    it('should explicitly resolve class registration with provision:bundle', () => {
      class Clss { 
        public readonly value: string
        public constructor(bundle: InjectionBundle) { 
          this.value = `${bundle['foo']}:${bundle['bar']}`
        }
      }

      const registration = InjectionRegistration.create({
        resolution: 'eager',
        class: Clss,
        provision: 'bundle',
      })

      const bundle = { foo: 'x', bar: 'y' }

      const result = registration.resolve({ bundle })

      const expected = new Clss(bundle)

      expect(result).toEqual(expected)
    })

    it('should implicitly resolve class registration with lifecycle:singleton', () => {
      const spy = jest.fn()

      class Clss { 
        public readonly value: string
        public constructor(foo: string, bar: string) { 
          this.value = `${foo}:${bar}`
          spy()
        }
      }

      const registration = InjectionRegistration.create({
        class: Clss,
        resolution: 'eager',
      })

      const result_a = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      const result_b = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result_a).toBe(result_b)
      expect(result_a).toEqual({ value: 'x:y' })
      expect(result_b).toEqual({ value: 'x:y' })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should explicitly resolve class registration with lifecycle:singleton', () => {
      const spy = jest.fn()

      class Clss { 
        public readonly value: string
        public constructor(foo: string, bar: string) { 
          spy()
          this.value = `${foo}:${bar}`
        }
      }


      const registration = InjectionRegistration.create({
        class: Clss,
        resolution: 'eager',
        lifecycle: 'singleton',
      })

      const result_a = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      const result_b = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result_a).toBe(result_b)
      expect(result_a).toEqual({ value: 'x:y' })
      expect(result_b).toEqual({ value: 'x:y' })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should explicitly resolve class registration with lifecycle:transient', () => {
      const spy = jest.fn()

      class Clss { 
        public readonly value: string
        public constructor(foo: string, bar: string) { 
          spy()
          this.value = `${foo}:${bar}`
        }
      }

      const registration = InjectionRegistration.create({
        class: Clss,
        resolution: 'eager',
        lifecycle: 'transient',
      })

      const result_a = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      const result_b = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result_a).not.toBe(result_b)
      expect(result_a).toEqual({ value: 'x:y' })
      expect(result_b).toEqual({ value: 'x:y' })
      expect(spy).toHaveBeenCalledTimes(2)
    })

    it('should explicitly resolve class registration with lifecycle:scoped', () => {
      const spy = jest.fn()

      class Clss { 
        public readonly value: string
        public constructor(foo: string, bar: string) {
          spy()
          this.value = `${foo}:${bar}`
        }
      }

      const registration = InjectionRegistration.create({
        class: Clss,
        lifecycle: 'scoped',
        resolution: 'eager',
      })

      const context = InjectionContext.create()

      const result_a = registration.resolve({
        bundle: { foo: 'x', bar: 'y' },
        context,
      })

      const result_b = registration.resolve({
        bundle: { foo: 'x', bar: 'y' },
        context,
      })

      const result_c = registration.resolve({
        bundle: { foo: 'x', bar: 'y' },
      })

      expect(result_a).toBe(result_b)
      expect(result_a).not.toBe(result_c)
      expect(result_b).not.toBe(result_c)
      expect(result_a).toEqual({ value: 'x:y' })
      expect(result_b).toEqual({ value: 'x:y' })
      expect(result_c).toEqual({ value: 'x:y' })
      expect(spy).toHaveBeenCalledTimes(2)
    })

    it('should implicitly resolve class registration mode with resolution:proxy', () => {
      const spy = jest.fn()

      class Clss { 
        public readonly value: string
        public constructor(foo: string, bar: string) { 
          spy()
          this.value = `${foo}:${bar}`
        }
      }

      const registration = InjectionRegistration.create({ class: Clss })

      const result = registration.resolve({ bundle: { foo: 'x', bar: 'y' }})

      expect(spy).toHaveBeenCalledTimes(0)

      result.value

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should explicitly resolve class registration mode with resolution:proxy', () => {
      const spy = jest.fn()

      class Clss { 
        public readonly value: string
        public constructor(foo: string, bar: string) { 
          spy()
          this.value = `${foo}:${bar}`
        }
      }

      const registration = InjectionRegistration.create({
        resolution: 'proxy',
        class: Clss 
      })

      const result = registration.resolve({
        bundle: { foo: 'x', bar: 'y' },
      })

      expect(spy).toHaveBeenCalledTimes(0)

      result.value

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should explicitly resolve class registration mode with resolution:eager', () => {
      const spy = jest.fn()

      class Clss { 
        public readonly value: string
        public constructor(foo: string, bar: string) {
          spy()
          this.value = `${foo}:${bar}`
        }
      }

      const registration = InjectionRegistration.create({
        class: Clss,
        resolution: 'eager',
        lifecycle: 'scoped',
      })

      const context = InjectionContext.create()

      registration.resolve({
        bundle: { foo: 'x', bar: 'y' },
        context,
      })

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should implicitly create class registration with visibility:public', () => {
      class Clss { }
      const registration = InjectionRegistration.create({ class: Clss  })
      expect(registration.visibility).toBe('public')
    })

    it('should explicitly create class registration with visibility:public', () => {
      class Clss { }
      const registration = InjectionRegistration.create({ class: Clss, visibility: 'public' })
      expect(registration.visibility).toBe('public')
    })

    it('should explicitly create class registration with visibility:private', () => {
      class Clss { }
      const registration = InjectionRegistration.create({ class: Clss, visibility: 'private' })
      expect(registration.visibility).toBe('private')
    })
  })

  describe('FactoryRegistration', () => {
    it('should implicitly resolve factory registration with provision:parameters', () => {
      const fn = (foo: string, bar: string) => {
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({
        resolution: 'eager',
        factory: fn,
      })

      const result = registration.resolve({ 
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result).toEqual({ value: 'x:y' })
    })

    it('should explicitly resolve factory registration with provision:parameters', () => {
      const fc = (foo: string, bar: string) => {
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({
        provision: 'parameters',
        resolution: 'eager',
        factory: fc,
      })

      const result = registration.resolve({ 
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result).toEqual({ value: 'x:y' })
    })

    it('should explicitly resolve factory registration with provision:bundle', () => {
      const fc = (bundle: InjectionBundle) => {
        return { value: `${bundle['foo']}:${bundle['bar']}` }
      }

      const registration = InjectionRegistration.create({
        function: fc,
        resolution: 'eager',
        provision: 'bundle',
      })

      const result = registration.resolve({ 
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result).toEqual({value: 'x:y' })
    })

    it('should implicitly resolve factory registration with lifecycle:singleton', () => {
      const spy = jest.fn()

      const fc = (foo: string, bar: string) => {
        spy()
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({
        resolution: 'eager',
        factory: fc,
      })

      const result_a = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      const result_b = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result_a).toBe(result_b)
      expect(result_a).toEqual({ value: 'x:y' })
      expect(result_b).toEqual({ value: 'x:y' })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should explicitly resolve factory registration with lifecycle:singleton', () => {
      const spy = jest.fn()

      const fc = (foo: string, bar: number) => {
        spy()
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({
        factory: fc,
        resolution: 'eager',
        lifecycle: 'singleton',
      })

      const result_a = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      const result_b = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result_a).toBe(result_b)
      expect(result_a).toEqual({ value: 'x:y' })
      expect(result_b).toEqual({ value: 'x:y' })
      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should explicitly resolve factory registration with lifecycle:transient', () => {
      const spy = jest.fn()

      const fc = (foo: string, bar: number) => {
        spy()
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({
        factory: fc,
        resolution: 'eager',
        lifecycle: 'transient',
      })

      const result_a = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      const result_b = registration.resolve({
        bundle: { foo: 'x', bar: 'y' }
      })

      expect(result_a).not.toBe(result_b)
      expect(result_a).toEqual({ value: 'x:y' })
      expect(result_b).toEqual({ value: 'x:y' })
      expect(spy).toHaveBeenCalledTimes(2)
    })

    it('should explicitly resolve factory registration with lifecycle:scoped', () => {
      const spy = jest.fn()

      const fc = (foo: string, bar: number) => {
        spy()
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({
        factory: fc,
        resolution: 'eager',
        lifecycle: 'scoped',
      })

      const context = InjectionContext.create()

      const result_a = registration.resolve({
        bundle: { foo: 'x', bar: 'y' },
        context,
      })

      const result_b = registration.resolve({
        bundle: { foo: 'x', bar: 'y' },
        context,
      })

      const result_c = registration.resolve({
        bundle: { foo: 'x', bar: 'y' },
      })

      expect(result_a).toBe(result_b)
      expect(result_a).not.toBe(result_c)
      expect(result_b).not.toBe(result_c)
      expect(result_a).toEqual({ value: 'x:y' })
      expect(result_b).toEqual({ value: 'x:y' })
      expect(result_c).toEqual({ value: 'x:y' })
      expect(spy).toHaveBeenCalledTimes(2)
    })

    it('should implicitly resolve factory registration mode with resolution:proxy', () => {
      const spy = jest.fn()

      const fc = (foo: string, bar: number) => {
        spy()
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({
        factory: fc
      })

      const result = registration.resolve({ bundle: { foo: 'x', bar: 'y' }})

      expect(spy).toHaveBeenCalledTimes(0)

      result.value

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should explicitly resolve factory registration mode with resolution:proxy', () => {
      const spy = jest.fn()

      const fc = (foo: string, bar: number) => {
        spy()
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({
        resolution: 'proxy',
        factory: fc
      })

      const result = registration.resolve({
        bundle: { foo: 'x', bar: 'y' },
      })

      expect(spy).toHaveBeenCalledTimes(0)

      result.value

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should explicitly resolve factory registration mode with resolution:eager', () => {
      const spy = jest.fn()

      const fc = (foo: string, bar: number) => {
        spy()
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({
        resolution: 'eager',
        factory: fc
      })

      const context = InjectionContext.create()

      registration.resolve({
        bundle: { foo: 'x', bar: 'y' },
        context,
      })

      expect(spy).toHaveBeenCalledTimes(1)
    })

    it('should implicitly create factory registration with visibility:public', () => {
      const fc = (foo: string, bar: number) => {
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({ factory: fc })
      expect(registration.visibility).toBe('public')
    })

    it('should explicitly create factory registration with visibility:public', () => {
      const fc = (foo: string, bar: number) => {
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({ factory: fc, visibility: 'public' })
      expect(registration.visibility).toBe('public')
    })

    it('should explicitly create factory registration with visibility:private', () => {
      const fc = (foo: string, bar: number) => {
        return { value: `${foo}:${bar}` }
      }

      const registration = InjectionRegistration.create({ factory: fc, visibility: 'private' })
      expect(registration.visibility).toBe('private')
    })
  })
})
