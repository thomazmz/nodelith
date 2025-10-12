import { InjectionModule } from '@nodelith/injection'
import { ControllerActions } from './controller-actions'

class TestDependency {
  private readonly name: string = 'TestController'

  public getMessage(): string {
    return `Hello from ${this.name}`
  }
}

class TestController {
  private readonly name: string = 'TestController'

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

describe('ControllerActions', () => {
  const injectionModule = InjectionModule.create()

  injectionModule.registerClass('dependency', TestDependency)

  const injectionModuleSpy = jest.spyOn(InjectionModule, 'resolveClass')

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create an actions object that contains expected controller methods', () => {
    const controllerActions = ControllerActions.extract(TestController, injectionModule)

    const result = controllerActions.getMessage()

    expect(result).toBe('Hello from TestController')
  })

  it('should handle method arguments', () => {
    const controllerActions = ControllerActions.extract(TestController, injectionModule)

    const result = controllerActions.add(5, 3)

    expect(result).toBe(8)
  })

  it('should preserve this context', () => {
    const controllerActions = ControllerActions.extract(TestController, injectionModule)

    const result = controllerActions.getName()

    expect(result).toBe('TestController')
  })

  it('should resolve a new instance for each method call', () => {
    const controllerActions = ControllerActions.extract(TestController, injectionModule)

    controllerActions.getMessage()
    controllerActions.getMessage()
    controllerActions.getMessage()

    expect(injectionModuleSpy).toHaveBeenCalledTimes(3)
    expect(injectionModuleSpy).toHaveBeenCalledWith(TestController, injectionModule)
  })

  it('should handle methods that throw errors', () => {
    const controllerActions = ControllerActions.extract(TestController, injectionModule)

    expect(() => {
      controllerActions.throwError()
    }).toThrow('Method error')
  })

  it('should handle methods that return undefined', () => {
    const controllerActions = ControllerActions.extract(TestController, injectionModule)

    const result = controllerActions.doNothing()

    expect(result).toBeUndefined()
  })

  it('should handle async methods', async () => {
    const controllerActions = ControllerActions.extract(TestController, injectionModule)

    const result = await controllerActions.doAsync()

    expect(result).toBe('data')
  })
})

