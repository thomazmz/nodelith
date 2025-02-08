import { Module } from './module'

describe('Module', () => {
  describe('has', () => {
    it('should return true when module contains public registration token', () => {
      const module = new Module()
      module.register('registration_0', {
        access: 'public', 
        factory: () => ({ value: 'registration_0' })
      })
      expect(module.has('registration_0')).toBe(true)
    })
    it('should return true when module contains private registration token', () => {
      const module = new Module()
      module.register('registration_0', {
        access: 'public', 
        factory: () => ({ value: 'registration_0' })
      })
      expect(module.has('registration_0')).toBe(true)
    })
    it('should return false when module does not contain registration token', () => {
      const module = new Module()
      expect(module.has('registration_0')).toBe(false)
    })
  })
  describe('exposes', () => {
    it('should return true when module contain public registration token', () => {
      const module = new Module()
      module.register('registration_0', {
        access: 'public', 
        factory: () => ({ value: 'registration_0' })
      })
      expect(module.exposes('registration_0')).toBe(true)
    })
    it('should return false when module contain private registration token', () => {
      const module = new Module()
      module.register('registration_0', {
        access: 'private', 
        factory: () => ({ value: 'registration_0' })
      })
      expect(module.exposes('registration_0')).toBe(false)
    })
    it('should return false when module does not contain registration token', () => {
      const module = new Module()
      expect(module.exposes('registration_0')).toBe(false)
    })
  })
  describe('clone', () => {
    it('should create new object reference', () => {
      const module = new Module()

      module.register('registration_0', { factory: () => {
        return { value: 'registration_0'}
      }})

      const clone = module.clone()
      expect(clone).not.toBe(module)
    
      const moduleResolution  = module.resolve('registration_0')
      const cloneResolution = clone.resolve('registration_1')
      expect(moduleResolution).not.toBe(cloneResolution)
    })
    it('should have all downstream public registrations', () => {
      const module_0 = new Module()
      module_0.register('registration_0', { access: 'public', factory: () => ({ value: 'registration_0'}) })

      const module_1 = new Module()
      module_1.register('registration_1', { access: 'public', factory: () => ({ value: 'registration_1'}) })
      module_1.useModule(module_0)

      const module_2 = new Module()
      module_2.register('registration_2', { access: 'public', factory: () => ({ value: 'registration_2'}) })
      module_2.useModule(module_1)

      const clone = module_2.clone()

      expect(clone.has('registration_0')).toBe(true)
      expect(clone.has('registration_1')).toBe(true)
      expect(clone.has('registration_2')).toBe(true)
    })
    it('should have all downstream private registrations', () => {
      const module_0 = new Module()
      module_0.register('registration_0', { access: 'public', factory: () => ({ value: 'registration_0'}) })

      const module_1 = new Module()
      module_1.register('registration_1', { access: 'private', factory: () => ({ value: 'registration_1'}) })
      module_1.useModule(module_0)

      const module_2 = new Module()
      module_2.register('registration_2', { access: 'private', factory: () => ({ value: 'registration_2'}) })
      module_2.useModule(module_1)

      const clone = module_2.clone()

      expect(clone.has('registration_0')).toBe(true)
      expect(clone.has('registration_1')).toBe(true)
      expect(clone.has('registration_2')).toBe(true)
    })
    it('should expose all downstream public registrations', () => {
      const module_0 = new Module()
      module_0.register('registration_0', { access: 'public', factory: () => ({ value: 'registration_0'}) })

      const module_1 = new Module()
      module_1.register('registration_1', { access: 'public', factory: () => ({ value: 'registration_1'}) })
      module_1.useModule(module_0)

      const module_2 = new Module()
      module_2.register('registration_2', { access: 'public', factory: () => ({ value: 'registration_2'}) })
      module_2.useModule(module_1)

      const clone = module_2.clone()

      expect(clone.exposes('registration_0')).toBe(true)
      expect(clone.exposes('registration_1')).toBe(true)
      expect(clone.exposes('registration_2')).toBe(true)
    })
    it('should not expose downstream private registrations', () => {
      const module_0 = new Module()
      module_0.register('registration_0', { access: 'public', factory: () => ({ value: 'registration_0'}) })

      const module_1 = new Module()
      module_1.register('registration_1', { access: 'private', factory: () => ({ value: 'registration_1'}) })
      module_1.useModule(module_0)

      const module_2 = new Module()
      module_2.register('registration_2', { access: 'private', factory: () => ({ value: 'registration_2'}) })
      module_2.useModule(module_1)

      const clone = module_2.clone()

      expect(clone.exposes('registration_0')).toBe(true)
      expect(clone.exposes('registration_1')).toBe(false)
      expect(clone.exposes('registration_2')).toBe(false)
    })
  })
  describe('resolve', () => {
    it('should resolve registration value', () => {
      const module = new Module()
      module.register('registration', { factory: () => {
        return { value: 'registration'}
      }})
      expect(module.resolve('registration')).toEqual({ value: 'registration' })
    })
    it('should return undefined for unregistered token', () => {
      const container = new Module()
      expect(container.resolve('registration')).toBe(undefined)
    })
    it('should resolve source modules public registrations', () => {
      const targetModule = new Module()
      targetModule.register('registration_0', { access: 'private', factory: () => {
        return { value: 'registration_0' }
      }})

      const sourceModule_1 = new Module()
      sourceModule_1.register('registration_1', { access: 'public',  factory: () => {
        return { value: 'registration_1'}
      }})

      const sourceModule_2 = new Module()
      sourceModule_2.register('registration_2', { access: 'public',  factory: () => {
        return { value: 'registration_2'}
      }})

      targetModule.useModules(
        sourceModule_1,
        sourceModule_2,
      )

      expect(targetModule.resolve('registration_0')).toEqual(undefined)

      expect(targetModule.resolve('registration_1')).toEqual({
        value: 'registration_1'
      })

      expect(targetModule.resolve('registration_2')).toEqual({
        value: 'registration_2'
      })
    })
    it('should resolve token through target module public registration', () => {
      const targetModule = new Module()
      targetModule.register('token', { access: 'public', factory: () => {
        return { value: 'registration_0' }
      }})

      const sourceModule_1 = new Module()
      sourceModule_1.register('token', { access: 'public',  factory: () => {
        return { value: 'registration_1'}
      }})

      const sourceModule_2 = new Module()
      sourceModule_2.register('token', { access: 'public',  factory: () => {
        return { value: 'registration_2'}
      }})

      targetModule.useModules(
        sourceModule_1,
        sourceModule_2,
      )

      targetModule.useModules(
        sourceModule_1,
        sourceModule_2,
      )

      expect(targetModule.resolve('token')).toEqual({
        value: 'registration_0'
      })
    })
    it('should resolve token through source module when token is private on the target', () => {
      const targetModule = new Module()
      targetModule.register('token', { access: 'private', factory: () => {
        return { value: 'registration_0' }
      }})

      const sourceModule_1 = new Module()
      sourceModule_1.register('token', { access: 'private',  factory: () => {
        return { value: 'registration_1'}
      }})

      const sourceModule_2 = new Module()
      sourceModule_2.register('token', { access: 'public',  factory: () => {
        return { value: 'registration_2'}
      }})

      targetModule.useModules(
        sourceModule_1,
        sourceModule_2,
      )

      expect(targetModule.resolve('token')).toEqual({
        value: 'registration_2'
      })
    })
    it('should return undefined when attempting to resolve target module private registrations', () => {
      const targetModule = new Module()
      targetModule.register('toke', { access: 'private', factory: () => {
        return { value: 'registration_0' }
      }})

      const sourceModule = new Module()
      sourceModule.register('token', { access: 'private',  factory: () => {
        return { value: 'registration_1'}
      }})

      targetModule.useModule(sourceModule)

      expect(targetModule.resolve('token')).toEqual(undefined)
    })
    it('should return undefined when attempting to resolve source module private registrations', () => {
      const targetModule = new Module()
      targetModule.register('registration_0', { access: 'public', factory: () => {
        return { value: 'registration_0' }
      }})

      const sourceModule = new Module()
      sourceModule.register('registration_1', { access: 'private',  factory: () => {
        return { value: 'registration_1'}
      }})

      targetModule.useModule(sourceModule)

      expect(targetModule.resolve('registration_1')).toEqual(undefined)
    })
  })
  describe('useModule', () => {
    it('should hold source module public registrations', () => {
      const targetModule = new Module()
      targetModule.register('registration_0', { access: 'public', factory: () => {
        return { value: 'registration_0'}
      }})

      const sourceModule = new Module()
      sourceModule.register('registration_1', { access: 'public', factory: () => {
        return { value: 'registration_1'}
      }})

      targetModule.useModule(sourceModule)

      expect(targetModule.has('registration_0')).toBe(true)
      expect(targetModule.has('registration_1')).toBe(true)
    })
    it('should hold source module private registrations', () => {
      const targetModule = new Module()
      targetModule.register('registration_0', { access: 'private', factory: () => {
        return { value: 'registration_0' }
      }})

      const sourceModule = new Module()
      sourceModule.register('registration_1', { access: 'private',  factory: () => {
        return { value: 'registration_1'}
      }})

      targetModule.useModule(sourceModule)

      expect(targetModule.has('registration_0')).toBe(true)
      expect(targetModule.has('registration_1')).toBe(true)
    })
    it('should expose source module public registrations', () => {
      const targetModule = new Module()
      targetModule.register('registration_0', { access: 'public', factory: () => {
        return { value: 'registration_0'}
      }})

      const sourceModule = new Module()
      sourceModule.register('registration_1', { access: 'public', factory: () => {
        return { value: 'registration_1'}
      }})

      targetModule.useModule(sourceModule)

      expect(targetModule.exposes('registration_0')).toBe(true)
    })
    it('should not expose source module private registrations', () => {
      const targetModule = new Module()
      targetModule.register('registration_0', { access: 'private', factory: () => {
        return { value: 'registration_0' }
      }})

      const sourceModule = new Module()
      sourceModule.register('registration_1', { access: 'public',  factory: () => {
        return { value: 'registration_1'}
      }})

      targetModule.useModule(sourceModule)

      expect(targetModule.exposes('registration_0')).toBe(false)
    })
    it('should resolve source module public registrations', () => {
      const targetModule = new Module()
      targetModule.register('registration_0', { access: 'public', factory: () => {
        return { value: 'registration_0' }
      }})

      const sourceModule = new Module()
      sourceModule.register('registration_1', { access: 'public',  factory: () => {
        return { value: 'registration_1'}
      }})

      targetModule.useModule(sourceModule)

      expect(targetModule.resolve('registration_1')).toEqual({
        value: 'registration_1'
      })
    })
    it('should resolve token through target module public registration', () => {
      const targetModule = new Module()
      targetModule.register('token', { access: 'public', factory: () => {
        return { value: 'registration_0' }
      }})

      const sourceModule = new Module()
      sourceModule.register('token', { access: 'public',  factory: () => {
        return { value: 'registration_1'}
      }})

      targetModule.useModule(sourceModule)

      expect(targetModule.resolve('token')).toEqual({
        value: 'registration_0'
      })
    })
    it('should resolve token through source target module public registration', () => {
      const targetModule = new Module()
      targetModule.register('token', { access: 'private', factory: () => {
        return { value: 'registration_0' }
      }})

      const sourceModule = new Module()
      sourceModule.register('token', { access: 'public',  factory: () => {
        return { value: 'registration_1'}
      }})

      targetModule.useModule(sourceModule)

      expect(targetModule.resolve('token')).toEqual({
        value: 'registration_1'
      })
    })
  })
  describe.only('useModules', () => {
    it('should hold source modules public registrations', () => {
      const targetModule = new Module()
      targetModule.register('registration_0', { access: 'public', factory: () => {
        return { value: 'registration_0'}
      }})

      const sourceModule_1 = new Module()
      sourceModule_1.register('registration_1', { access: 'public', factory: () => {
        return { value: 'registration_1'}
      }})

      const sourceModule_2 = new Module()
      sourceModule_2.register('registration_2', { access: 'public', factory: () => {
        return { value: 'registration_2'}
      }})

      targetModule.useModules(
        sourceModule_1,
        sourceModule_2,
      )

      expect(targetModule.has('registration_0')).toBe(true)
      expect(targetModule.has('registration_1')).toBe(true)
      expect(targetModule.has('registration_2')).toBe(true)
    })
    it('should hold source modules private registrations', () => {
      const targetModule = new Module()
      targetModule.register('registration_0', { access: 'private', factory: () => {
        return { value: 'registration_0' }
      }})

      const sourceModule_1 = new Module()
      sourceModule_1.register('registration_1', { access: 'private', factory: () => {
        return { value: 'registration_1'}
      }})

      const sourceModule_2 = new Module()
      sourceModule_2.register('registration_2', { access: 'private', factory: () => {
        return { value: 'registration_2'}
      }})

      targetModule.useModules(
        sourceModule_1,
        sourceModule_2,
      )

      expect(targetModule.has('registration_0')).toBe(true)
      expect(targetModule.has('registration_1')).toBe(true)
      expect(targetModule.has('registration_2')).toBe(true)
    })
    it('should expose source modules public registrations', () => {
      const targetModule = new Module()
      targetModule.register('registration_0', { access: 'private', factory: () => {
        return { value: 'registration_0'}
      }})

      const sourceModule_1 = new Module()
      sourceModule_1.register('registration_1', { access: 'public', factory: () => {
        return { value: 'registration_1'}
      }})

      const sourceModule_2 = new Module()
      sourceModule_2.register('registration_2', { access: 'public', factory: () => {
        return { value: 'registration_2'}
      }})

      targetModule.useModules(
        sourceModule_1,
        sourceModule_2,
      )

      expect(targetModule.exposes('registration_0')).toBe(false)
      expect(targetModule.exposes('registration_1')).toBe(true)
      expect(targetModule.exposes('registration_2')).toBe(true)
    })
    it('should not expose source modules private registrations', () => {
      const targetModule = new Module()
      targetModule.register('registration_0', { access: 'public', factory: () => {
        return { value: 'registration_0' }
      }})

      const sourceModule_1 = new Module()
      sourceModule_1.register('registration_1', { access: 'private',  factory: () => {
        return { value: 'registration_1'}
      }})

      const sourceModule_2 = new Module()
      sourceModule_2.register('registration_2', { access: 'private',  factory: () => {
        return { value: 'registration_2'}
      }})

      targetModule.useModules(
        sourceModule_1,
        sourceModule_2,
      )

      expect(targetModule.exposes('registration_0')).toBe(true)
      expect(targetModule.exposes('registration_1')).toBe(false)
      expect(targetModule.exposes('registration_2')).toBe(false)
    })
    it('should expose private registrations to downstream modules', () => {
      const module_0 = new Module()
      const module_1 = new Module()
      const module_2 = new Module()

      module_0.register('registration_0', { access: 'public', factory: (bundle) => {
        return { 
          value: 'registration_0',
          registration_1: bundle.registration_1.value,
          registration_2: bundle.registration_2.value,
        }
      }})

      module_1.register('registration_1', { access: 'public', factory: (bundle) => {
        return { 
          value: 'registration_1',
          registration_2: bundle.registration_2.value,
        }
      }})

      module_2.register('registration_2', { access: 'private', factory: (bundle) => {
        return {
          value: 'registration_2',
        }
      }})

      module_1.useModule(module_0)
      module_2.useModule(module_1)

      expect(module_2.resolve('registration_0')).toEqual({
        value: 'registration_0',
        registration_1: 'registration_1',
        registration_2: 'registration_2',
      })

      expect(module_2.resolve('registration_1')).toEqual({
        value: 'registration_1',
        registration_2: 'registration_2',
      })
    })
    it('should expose private registrations to downstream modules', () => {
      const module_0 = new Module()
      const module_1 = new Module()
      const module_2 = new Module()

      module_0.register('registration_0', { access: 'public', factory: (bundle) => {
        return { 
          value: 'registration_0',
          registration_1: bundle.registration_1.value,
          registration_2: bundle.registration_2.value,
        }
      }})

      module_1.register('registration_1', { access: 'public', factory: (bundle) => {
        return { 
          value: 'registration_1',
          registration_2: bundle.registration_2.value,
        }
      }})

      module_2.register('registration_2', { access: 'private', factory: (bundle) => {
        return {
          value: 'registration_2',
        }
      }})

      module_1.useModule(module_0)
      module_2.useModule(module_1)

      expect(module_2.resolve('registration_0')).toEqual({
        value: 'registration_0',
        registration_1: 'registration_1',
        registration_2: 'registration_2',
      })

      expect(module_2.resolve('registration_1')).toEqual({
        value: 'registration_1',
        registration_2: 'registration_2',
      })
    })
    it('should expose public registrations to downstream modules', () => {
      const module_0 = new Module()
      const module_1 = new Module()
      const module_2 = new Module()

      module_0.register('registration_0', { access: 'public', factory: (bundle) => {
        return { 
          value: 'registration_0',
          registration_1: bundle.registration_1.value,
          registration_2: bundle.registration_2.value,
        }
      }})

      module_1.register('registration_1', { access: 'public', factory: (bundle) => {
        return { 
          value: 'registration_1',
          registration_2: bundle.registration_2.value,
        }
      }})

      module_2.register('registration_2', { access: 'public', factory: (bundle) => {
        return {
          value: 'registration_2',
        }
      }})

      module_1.useModule(module_0)
      module_2.useModule(module_1)

      expect(module_2.resolve('registration_0')).toEqual({
        value: 'registration_0',
        registration_1: 'registration_1',
        registration_2: 'registration_2',
      })

      expect(module_2.resolve('registration_1')).toEqual({
        value: 'registration_1',
        registration_2: 'registration_2',
      })

      expect(module_2.resolve('registration_2')).toEqual({
        value: 'registration_2',
      })
    })
    xit('should expose public registrations to upstream modules', () => {
      const module_0 = new Module()
      const module_1 = new Module()
      const module_2 = new Module()

      module_0.register('registration_0', { access: 'public', factory: (bundle) => {
        return { 
          value: 'registration_0',
          registration_1: bundle.registration_1.value,
        }
      }})

      module_1.register('registration_1', { access: 'public', factory: (bundle) => {
        return { 
          value: 'registration_1',
          registration_0: bundle.registration_0.value,
          // registration_2: bundle.registration_2.value,
        }
      }})

      module_2.register('registration_2', { access: 'public', factory: (bundle) => {
        return { 
          value: 'registration_2',
          registration_0: bundle.registration_0.value,
          registration_1: bundle.registration_1.value,
        }
      }})

      module_0.useModule(module_1)
      module_0.useModule(module_2)

      console.log(module_0.resolve('registration_1'))
      // console.log(module_0.resolve('registration_2'))

    })
    it.only('should expose public registrations to downstream modules', () => {
      const module_0 = new Module()
      const module_1 = new Module()
      // const module_2 = new Module()

      module_0.register('registration_0', { access: 'public', factory: (bundle) => {
        return { 
          value: 'registration_0',
          registration_1a: bundle.registration_1.value,
        }
      }})

      module_0.register('registration_1', { access: 'public', factory: (bundle) => {
        return { 
          value: 'registration_1a',
        }
      }})

      module_1.register('registration_1', { access: 'public', factory: (bundle) => {
        return {
          value: 'registration_1b',
        }
      }})

      module_1.useModule(module_0)

      expect(module_1.resolve('registration_0')).toEqual({
        value: 'registration_0',
        registration_1a: 'registration_1a',
      })

      expect(module_1.resolve('registration_1')).toEqual({
        value: 'registration_1b',
      })

      // expect(module_1.resolve('registration_2')).toEqual({
      //   value: 'registration_2',
      // })
    })
    it.todo('should not expose private registrations to upstream modules')
  })
})