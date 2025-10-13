import { InjectionModule } from '@nodelith/injection'
import { InjectionFacade } from './injection-facade'

class TestDependency {
  private readonly name: string = 'TestFacade'

  public getMessage(): string {
    return `Hello from ${this.name}`
  }
}

class TestFacade {
  private readonly name: string = 'TestFacade'

  private readonly dependency: TestDependency

  constructor(dependency: TestDependency) {
    this.dependency = dependency
  }

  public getMessage(): string {
    return this.dependency.getMessage()
  }

  public getName(): string {
    return this.name
  }

  public add(a: number, b: number): number {
    return a + b
  }

  public throwError(): void {
    throw new Error('Method error')
  }

  public doNothing(): void {
    // does nothing
  }

  public doAsync(): Promise<string> {
    return Promise.resolve('data')
  }
}

describe('InjectionGateway', () => {
  const injectionModule = InjectionModule.create()

  injectionModule.register('dependency', { class: TestDependency })

  const injectionModuleSpy = jest.spyOn(InjectionModule.prototype, 'resolve')

  beforeEach(() => jest.clearAllMocks())

  it('should create an actions object that contains expected constructor methods', () => {
    const injectionGateway = InjectionFacade.create(injectionModule, TestFacade)

    const result = injectionGateway.getMessage()

    expect(result).toBe('Hello from TestFacade')
  })

  it('should handle method arguments', () => {
    const injectionGateway = InjectionFacade.create(injectionModule, TestFacade)

    const result = injectionGateway.add(5, 3)

    expect(result).toBe(8)
  })

  it('should preserve this context', () => {
    const injectionGateway = InjectionFacade.create(injectionModule, TestFacade)

    const result = injectionGateway.getName()

    expect(result).toBe('TestFacade')
  })

  it('should resolve a new instance for each method call', () => {
    const injectionGateway = InjectionFacade.create(injectionModule, TestFacade)

    injectionGateway.getMessage()
    injectionGateway.getMessage()
    injectionGateway.getMessage()

    expect(injectionModuleSpy).toHaveBeenCalledTimes(3)
  })

  it('should handle methods that throw errors', () => {
    const injectionGateway = InjectionFacade.create(injectionModule, TestFacade)

    expect(() => {
      injectionGateway.throwError()
    }).toThrow('Method error')
  })

  it('should handle methods that return undefined', () => {
    const injectionGateway = InjectionFacade.create(injectionModule, TestFacade)

    const result = injectionGateway.doNothing()

    expect(result).toBeUndefined()
  })

  it('should handle async methods', async () => {
    const injectionGateway = InjectionFacade.create(injectionModule, TestFacade)

    const result = await injectionGateway.doAsync()

    expect(result).toBe('data')
  })
})
