import * as Injection from './index'

export class Container<B extends Injection.Bundle = any> {
  private readonly dependencyMap: Map<Injection.Token, Injection.Registration> = new Map()
  
  public readonly bundle: B

  public get registrations(): Injection.Registration[] {
    return Array.from(this.dependencyMap.values())
  }

  public push(...registrations: Injection.Registration[]): void {
    for (const registration of registrations) {
      this.dependencyMap.set(registration.token, registration)
    }
  }

  public has(token: Injection.Token): boolean {
    return this.dependencyMap.has(token)
  }

  public get(token: Injection.Token): Injection.Registration | undefined {
    return this.dependencyMap.get(token)
  }

  public constructor() {
    this.bundle = new Proxy(this.dependencyMap as any, {
      ownKeys(target) {
        console.log(Array.from(target.keys()))
        return Array.from(target.keys());
      },
      getOwnPropertyDescriptor(dependencyMap: Map<Injection.Token, Injection.Registration>, token: Injection.Token) {
        if (dependencyMap.has(token)) {
          return {
            value: Reflect.get(dependencyMap, token),
            enumerable: true,
            configurable: true,
          };
        }
        return undefined;
      },
      set(_dependencyMap: Map<Injection.Token, Injection.Registration>, token: Injection.Token) {
        throw new Error(`Could not set registration "${token.toString()}". Registration should not be done through bundle.`)
      },
      get(map: Map<Injection.Token, Injection.Registration>, token: Injection.Token) {
        if(!map.has(token)) {
          throw new Error(`Could not resolve dependency "${token.toString()}". Invalid registration token.`)
        }
    
        const registration = map.get(token)
    
        if(!registration) {
          throw new Error(`Could not resolve dependency "${token.toString()}". Missing registration object.`)
        }
    
        return new Proxy({} as any, {
          set: (_target, property) => {
            throw new Error(`Could not set dependency property "${property.toString()}". Dependency properties cannot be set through registration bundle.`)
          },
          get: (_target, property) => {
            return registration.instance[property];
          },
        })
      },
    })
  }
}
