import { 
  Registration,
  RegistrationToken,
  RegistrationBundle,
} from './registration'

export class Container<B extends RegistrationBundle = any> {
  private readonly dependencyMap: Map<RegistrationToken, Registration> = new Map()
  
  public readonly bundle: B

  public get registrations(): Registration[] {
    return Array.from(this.dependencyMap.values())
  }

  public push(...registrations: Registration[]): void {
    for (const registration of registrations) {
      this.dependencyMap.set(registration.token, registration)
    }
  }

  public has(token: RegistrationToken): boolean {
    return this.dependencyMap.has(token)
  }

  public get(token: RegistrationToken): Registration | undefined {
    return this.dependencyMap.get(token)
  }

  public constructor() {
    this.bundle = new Proxy(this.dependencyMap as any, {
      ownKeys(dependencyMap) {
        return Array.from(dependencyMap.keys());
      },
      getOwnPropertyDescriptor(dependencyMap: Map<RegistrationToken, Registration>, token: RegistrationToken) {
        if (dependencyMap.has(token)) {
          return {
            value: Reflect.get(dependencyMap, token),
            enumerable: true,
            configurable: true,
          };
        }
        return undefined;
      },
      set(_dependencyMap: Map<RegistrationToken, Registration>, token: RegistrationToken) {
        throw new Error(`Could not set registration "${token.toString()}". Registration should not be done through bundle.`)
      },
      get(dependencyMap: Map<RegistrationToken, Registration>, token: RegistrationToken) {
        if(!dependencyMap.has(token)) {
          throw new Error(`Could not resolve dependency "${token.toString()}". Invalid registration token.`)
        }

        const registration = dependencyMap.get(token)
    
        if(!registration) {
          throw new Error(`Could not resolve dependency "${token.toString()}". Missing registration object.`)
        }

        return registration.provide()
      },
    })
  }
}
