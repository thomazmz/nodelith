import { Bundle } from '../bundle'
import { Module } from './module'

describe('Module', () => {

  const createTestModule = (name?:  string): Module => {
    const suffix = name ? `_${name}` : ''
    const module = new Module()

    module.register(`bundle${suffix}`, {
      access: 'public',
      factory: (bundle: Bundle) => {
        return {
          [`publicRegistration${suffix}`]: bundle[`publicRegistration${suffix}`],
          [`privateRegistration${suffix}`]: bundle[`privateRegistration${suffix}`],
          [`internalRegistration${suffix}`]: bundle[`internalRegistration${suffix}`],
          [`externalRegistration${suffix}`]: bundle[`externalRegistration${suffix}`],
        }
      },
    })

    module.register(`publicRegistration${suffix}`, {
      access: 'public',
      factory: (bundle: Bundle) => {
        return {
          value: `publicRegistration${suffix}`,
          inspect(inspectFunction: (bundle: Bundle) => void) {
            inspectFunction(bundle)
          }
        }
      },
    })

    module.register(`externalRegistration${suffix}`, {
      access: 'external',
      factory: (bundle: Bundle) => {
        return {
          value: `externalRegistration${suffix}`,
          inspect(inspectFunction: (bundle: Bundle) => void) {
            inspectFunction(bundle)
          }
        }
      },
    })

    module.register(`internalRegistration${suffix}`, {
      access: 'internal',
      factory: (bundle: Bundle) => {
        return {
          value: `internalRegistration${suffix}`,
          inspect(inspectFunction: (bundle: Bundle) => void) {
            inspectFunction(bundle)
          }
        }
      },
    })

    module.register(`privateRegistration${suffix}`, {
      access: 'private',
      factory: (bundle: Bundle) => {
        return {
          value: `privateRegistration${suffix}`,
          inspect(inspectFunction: (bundle: Bundle) => void) {
            inspectFunction(bundle)
          }
        }
      },
    })
    
    return module;
  }

  describe('clone', () => {
    it('should create new object reference to the cloned module', () => {
      const module = createTestModule()

      const clone = module.clone()
      expect(clone).not.toBe(module)
    
      const moduleResolution  = module.resolve('publicRegistration')
      const cloneResolution = clone.resolve('publicRegistration')

      expect(moduleResolution).not.toBe(cloneResolution)
    })
  })

  describe('exposes', () => {
    it('should return true when checking exposure of public registration token', () => {
      const testModule = createTestModule()
      expect(testModule.exposes('publicRegistration')).toBe(true)
    })
    it('should return true when checking exposure of external registration token', () => {
      const testModule = createTestModule()
      expect(testModule.exposes('externalRegistration')).toBe(true)
    })
    it('should return false when checking exposure of private registration token', () => {
      const testModule = createTestModule()
      expect(testModule.exposes('privateRegistration')).toBe(false)
    })
    it('should return false when checking exposure of internal registration token', () => {
      const testModule = createTestModule()
      expect(testModule.exposes('internalRegistration')).toBe(false)
    })
  })

  describe('access', () => {
    it('should make registrations available to all module registrations', () => {
      const module_a =  createTestModule('a')
  
      const bundle_a = module_a.resolve('bundle_a');
      
      bundle_a.publicRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_a.value).toBe('privateRegistration_a')
        expect(bundle.internalRegistration_a.value).toBe('internalRegistration_a')
        expect(bundle.externalRegistration_a.value).toBe('externalRegistration_a')
      })
      
      bundle_a.privateRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_a.value).toBe('publicRegistration_a')
        expect(bundle.internalRegistration_a.value).toBe('internalRegistration_a')
        expect(bundle.externalRegistration_a.value).toBe('externalRegistration_a')
      })
      
      bundle_a.internalRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_a.value).toBe('publicRegistration_a')
        expect(bundle.privateRegistration_a.value).toBe('privateRegistration_a')
        expect(bundle.externalRegistration_a.value).toBe('externalRegistration_a')
      })
      
      bundle_a.externalRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_a.value).toBe('publicRegistration_a')
        expect(bundle.privateRegistration_a.value).toBe('privateRegistration_a')
        expect(bundle.internalRegistration_a.value).toBe('internalRegistration_a')
      })
    })
    it('should expose child public and external registrations to parent module', () => {
      const module_a = createTestModule('a')
      const module_b = createTestModule('b')
      module_b.extend(module_a)
  
      module_b.register('bundles', {
        'access': 'public',
        factory: (bundle: Bundle) => {
          return {
            bundle_a: bundle.bundle_a,
            bundle_b: bundle.bundle_b,
          }
        }
      })
  
      const { bundle_b } = module_b.resolve('bundles');
      
      bundle_b.publicRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_a.value).toBe('publicRegistration_a')
        expect(bundle.externalRegistration_a.value).toBe('externalRegistration_a')
      })
      
      bundle_b.privateRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_a.value).toBe('publicRegistration_a')
        expect(bundle.externalRegistration_a.value).toBe('externalRegistration_a')
      })
      
      bundle_b.internalRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_a.value).toBe('publicRegistration_a')
        expect(bundle.externalRegistration_a.value).toBe('externalRegistration_a')
      })
      
      bundle_b.externalRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_a.value).toBe('publicRegistration_a')
        expect(bundle.externalRegistration_a.value).toBe('externalRegistration_a')
      })
    })
    it('should expose parent public and internal registrations to child module', ()  => {
      const module_a = createTestModule('a')
      const module_b = createTestModule('b')
      module_b.extend(module_a)
  
      module_b.register('bundles', {
        'access': 'public',
        factory: (bundle: Bundle) => {
          return {
            bundle_a: bundle.bundle_a,
            bundle_b: bundle.bundle_b,
          }
        }
      })
  
      const { bundle_a } = module_b.resolve('bundles')
  
      bundle_a.publicRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_b.value).toEqual('publicRegistration_b')
        expect(bundle.internalRegistration_b.value).toEqual('internalRegistration_b')
      })
  
      bundle_a.privateRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_b.value).toEqual('publicRegistration_b')
        expect(bundle.internalRegistration_b.value).toEqual('internalRegistration_b')
      })
  
      bundle_a.internalRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_b.value).toEqual('publicRegistration_b')
        expect(bundle.internalRegistration_b.value).toEqual('internalRegistration_b')
      })
  
      bundle_a.externalRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_b.value).toEqual('publicRegistration_b')
        expect(bundle.internalRegistration_b.value).toEqual('internalRegistration_b')
      })
    })
    it('should not expose child private and internal registrations to parent module', () => {
      const module_a = createTestModule('a')
      const module_b = createTestModule('b')
      module_b.extend(module_a)
  
      module_b.register('bundles', {
        'access': 'public',
        factory: (bundle: Bundle) => {
          return {
            bundle_a: bundle.bundle_a,
            bundle_b: bundle.bundle_b,
          }
        }
      })
  
      const { bundle_b } = module_b.resolve('bundles');
      
      bundle_b.publicRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_a).toBe(undefined)
        expect(bundle.internalRegistration_a).toBe(undefined)
      })
      
      bundle_b.privateRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_a).toBe(undefined)
        expect(bundle.internalRegistration_a).toBe(undefined)
      })
      
      bundle_b.internalRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_a).toBe(undefined)
        expect(bundle.internalRegistration_a).toBe(undefined)
      })
      
      bundle_b.externalRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_a).toBe(undefined)
        expect(bundle.internalRegistration_a).toBe(undefined)
      })
    })
    it('should not expose parent private and external registrations to child module', ()  => {
      const module_a = createTestModule('a')
      const module_b = createTestModule('b')
      module_b.extend(module_a)
  
      module_b.register('bundles', {
        'access': 'public',
        factory: (bundle: Bundle) => {
          return {
            bundle_a: bundle.bundle_a,
            bundle_b: bundle.bundle_b,
          }
        }
      })
  
      const { bundle_a } = module_b.resolve('bundles')
  
      bundle_a.publicRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_b).toEqual(undefined)
        expect(bundle.externalRegistration_b).toEqual(undefined)
      })
  
      bundle_a.privateRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_b).toEqual(undefined)
        expect(bundle.externalRegistration_b).toEqual(undefined)
      })
  
      bundle_a.internalRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_b).toEqual(undefined)
        expect(bundle.externalRegistration_b).toEqual(undefined)
      })
  
      bundle_a.externalRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_b).toEqual(undefined)
        expect(bundle.externalRegistration_b).toEqual(undefined)
      })
    })
    it('should not expose child public and external registrations through parent module', () => {
      const module_a = createTestModule('a')
      const module_b = createTestModule('b')
  
      module_b.extend(module_a)
  
      expect(module_b.exposes('publicRegistration_a')).toBe(false)
      expect(module_b.exposes('privateRegistration_a')).toBe(false)
      expect(module_b.exposes('internalRegistration_a')).toBe(false)
      expect(module_b.exposes('externalRegistration_a')).toBe(false)
  
      expect(module_b.resolve('publicRegistration_a')).toBe(undefined)
      expect(module_b.resolve('privateRegistration_a')).toBe(undefined)
      expect(module_b.resolve('internalRegistration_a')).toBe(undefined)
      expect(module_b.resolve('externalRegistration_a')).toBe(undefined)
    })
  })

  describe('resolve', () => {
    it('should resolve registration value', () => {
      const module = createTestModule()

      const publicResolution = module.resolve('publicRegistration')
      const externalResolution = module.resolve('externalRegistration')

      expect(publicResolution.value).toEqual('publicRegistration')
      expect(externalResolution.value).toEqual('externalRegistration')
    })
    it('should return undefined for unregistered token', () => {
      const module = createTestModule()
      expect(module.resolve('unknownRegistration')).toBe(undefined)
    })
    it('should prioritize closest registration on module graph', () => {
      const module_a = createTestModule('a')
      const module_b = createTestModule('b')

      module_a.register('registration', {
        factory: () => ({
          module: 'a'
        })
      })

      module_b.register('registration', {
        factory: () => ({
          module: 'b'
        })
      })

      module_b.register('bundles', {
        factory: (bundle: Bundle) => ({
          bundle_a: bundle.bundle_a,
          bundle_b: bundle.bundle_b,
        })
      })

      module_b.extend(module_a)

      const { bundle_a,  bundle_b } = module_b.resolve('bundles')

      bundle_a.publicRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.registration.module).toBe('a')
      })

      bundle_a.externalRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.registration.module).toBe('a')
      })

      bundle_a.privateRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.registration.module).toBe('a')
      })

      bundle_a.internalRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.registration.module).toBe('a')
      })

      bundle_b.publicRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.registration.module).toBe('b')
      })

      bundle_b.externalRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.registration.module).toBe('b')
      })

      bundle_b.privateRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.registration.module).toBe('b')
      })

      bundle_b.internalRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.registration.module).toBe('b')
      })
    })
  })
})
