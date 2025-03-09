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

  describe('exposes', () => {
    it('should return true when checking exposure of public registration token', () => {
      const testModule = createTestModule()
      expect(testModule.exposes('publicRegistration')).toBe(true)
    })
    it('should return false when checking exposure of private registration token', () => {
      const testModule = createTestModule()
      expect(testModule.exposes('privateRegistration')).toBe(false)
    })
  })

  describe('access', () => {
    it('should make registrations available to all module registrations', () => {
      const module_a =  createTestModule('a')
  
      const bundle_a = module_a.resolve({ token: 'bundle_a' });
      
      bundle_a.publicRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_a.value).toBe('privateRegistration_a')
      })
      
      bundle_a.privateRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_a.value).toBe('publicRegistration_a')
      })
    })
    it('should expose public registrations when imported', () => {
      const module_a = createTestModule('a')
      const module_b = createTestModule('b')

      module_b.import(module_a)
  
      // module_b.register('bundles', {
      //   'access': 'public',
      //   factory: (bundle: Bundle) => {
      //     return {
      //       bundle_a: bundle.bundle_a,
      //       bundle_b: bundle.bundle_b,
      //     }
      //   }
      // })
  
      // const bundle_a = module_b.resolve({ token: 'bundle_a' });
      const bundle_b = module_b.resolve({ token: 'bundle_b' });
      
      bundle_b.publicRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_a.value).toBe('publicRegistration_a')
        expect(bundle.privateRegistration_b.value).toBe('privateRegistration_b')
      })
      
      bundle_b.privateRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_a.value).toBe('publicRegistration_a')
        expect(bundle.publicRegistration_b.value).toBe('publicRegistration_b')
      })
    })
    it('should not expose private registrations when imported', () => {
      const module_a = createTestModule('a')
      const module_b = createTestModule('b')
      module_b.import(module_a)
  
      module_b.register('bundles', {
        'access': 'public',
        factory: (bundle: Bundle) => {
          return {
            bundle_a: bundle.bundle_a,
            bundle_b: bundle.bundle_b,
          }
        }
      })
  
      const { bundle_b } = module_b.resolve({ token: 'bundles' });
      
      bundle_b.publicRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_a).toBe(undefined)
      })
      
      bundle_b.privateRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_a).toBe(undefined)
      })
    })
    it('should not expose registrations from imported module', () => {
      const module_a = createTestModule('a')
      const module_b = createTestModule('b')
      
      module_b.import(module_a)
  
      expect(module_b.exposes('publicRegistration_a')).toBe(false)
      expect(module_b.exposes('privateRegistration_a')).toBe(false)
    })
  })

  describe('resolve', () => {
    it('should resolve registration value', () => {
      const module = createTestModule()
      const publicResolution = module.resolve({ token: 'publicRegistration' })
      expect(publicResolution.value).toEqual('publicRegistration')
    })
    it('should return undefined for unregistered token', () => {
      const module = createTestModule()
      expect(module.resolve({ token: 'unknownRegistration' })).toBe(undefined)
    })
    it('should resolve circular dependencies', () => {
      const module_a = createTestModule('a')
      const module_b = createTestModule('b')
  
      module_a.import(module_b)
      module_b.import(module_a)
  
      const bundle_a = module_a.resolve({ token: 'bundle_a' });
      const bundle_b = module_b.resolve({ token: 'bundle_b' });
  
      bundle_a.publicRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_a.value).toBe('privateRegistration_a')
        expect(bundle.publicRegistration_b.value).toBe('publicRegistration_b')
      })
  
      bundle_a.privateRegistration_a.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_a.value).toBe('publicRegistration_a')
        expect(bundle.publicRegistration_b.value).toBe('publicRegistration_b')
      })
  
      bundle_b.publicRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.privateRegistration_b.value).toBe('privateRegistration_b')
        expect(bundle.publicRegistration_a.value).toBe('publicRegistration_a')
      })
  
      bundle_b.privateRegistration_b.inspect((bundle: Bundle) => {
        expect(bundle.publicRegistration_b.value).toBe('publicRegistration_b')
        expect(bundle.publicRegistration_a.value).toBe('publicRegistration_a')
      })
    })
  })
})
