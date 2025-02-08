import { Registration } from '../registration';
import { Bundle } from '../bundle';
import { Token } from '../token';
import crypto from 'crypto';

export type ContainerOptions = {
  name?: string
  bundle?: Bundle | undefined
}

export class Container {

  private static createIdentifier = () => crypto.randomBytes(2).toString('hex').slice(0, 4) 

  private readonly registrations: Map<Token, Registration> = new Map()

  private readonly resolving: Set<Token> = new Set()
  
  private readonly context: Bundle = {}

  public readonly bundle: Bundle

  public readonly symbol: Symbol
  
  public readonly label: string

  public readonly name: string

  public readonly id = Container.createIdentifier()

  public constructor(private readonly options: ContainerOptions = {}) {
    
    this.name = options.name ?? Container.createIdentifier()

    this.label = `${this.id}:${this.name}`

    this.symbol = Symbol(this.label)

    this.bundle = new Proxy(options?.bundle ?? {}, {
      set: (_target: Bundle, token: Token) => {
        throw new Error(`Could not set bundle key "${token.toString()}". Targets are not allowed to assign bundle values.`)
      },

      get: (target, token) => {
        return token in this.context
          ? this.context[token] 
          : target[token]
      },

      has: (target, token) => {
        return false
          || Reflect.ownKeys(this.context).includes(token)
          || Reflect.ownKeys(target).includes(token)
      },

      ownKeys: (target) => {
        return [
          ...new Set([
            ...Reflect.ownKeys(this.context),
            ...Reflect.ownKeys(target)
          ])
        ];
      },

      getOwnPropertyDescriptor: (target, token) => {
        return token in this.context 
          ? Reflect.getOwnPropertyDescriptor(this.context, token)
          : Reflect.getOwnPropertyDescriptor(target, token)
      },
    })
  }

  public exposes(token: Token): boolean {
    return this.registrations.get(token)?.access === 'public'
  }

  public has(token: Token): boolean  {
    return this.registrations.has(token)
  }

  public get(token: Token): Registration | undefined {
    return this.registrations.get(token)
  }

  public clone(bundle?: Bundle): Container {
    const containerClone = new Container({ ...this.options, bundle })
    const registrationValues = [...this.registrations.values()]
    registrationValues.filter(registration => registration.access === 'public')
    containerClone.push(...this.registrations.values())
    return containerClone
  }

  public push(...externalRegistration: Registration[]): Registration[] {
    return externalRegistration.map(registration => {
      return this.register(registration)
    })
  }

  public register(externalRegistration: Registration): Registration {
    const internalRegistration = externalRegistration.clone(this.bundle)
    this.registrations.set(internalRegistration.token, internalRegistration)
    Object.defineProperty(this.context, internalRegistration.token, {
      get: () => this.resolve(internalRegistration.token),
      configurable: true,
      enumerable: true,
    });
    return internalRegistration
  }

  public resolve(token: Token, bundle?: Bundle) {
    if (!this.has(token)) {
      return
    }

    if (this.resolving.has(token)) {
      return {}
    }

    const registration = this.get(token);

    if (!registration) {
      throw new Error(`Token '${token.toString()}' is not a valid registration.`);
    }

    this.resolving.add(token)

    const resolution = registration.resolve(bundle)

    this.resolving.delete(token);

    return resolution;
  }
}