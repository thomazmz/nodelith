import express from 'express'
import { InjectionFacade, InjectionBundle, InjectionContext } from '@nodelith/injection'
import { ExpressModule } from './express-module'
import { ExpressPlugin, bindExpressActions, createExpressPlugin, ExpressPluginRecord, ExpressPluginActions } from './express-plugin'

class TestDependency {
  public getMessage(): string {
    return 'Hello from TestDependency'
  }
}

class TestService {
  private readonly dependency: TestDependency

  constructor(dependency: TestDependency) {
    this.dependency = dependency
  }

  public getData(): string {
    return this.dependency.getMessage()
  }

  public async getDataAsync(): Promise<string> {
    return Promise.resolve('async data')
  }

  public calculate(a: number, b: number): number {
    return a + b
  }
}

class TestController {
  public getName(): string {
    return 'TestController'
  }

  public async getAsync(): Promise<string> {
    return Promise.resolve('async result')
  }
}

describe('bindExpressActions', () => {
  const module = ExpressModule.create()

  beforeEach(() => {
    module.register('dependency', { class: TestDependency })
    jest.clearAllMocks()
  })

  it('should create an actions object with all constructor keys', () => {
    const constructors = {
      TestService,
      TestController,
    }

    const actions = bindExpressActions(module, constructors)

    expect(actions).toHaveProperty('TestService')
    expect(actions).toHaveProperty('TestController')
  })

  it('should create gateway for each constructor using InjectionGateway.create', () => {
    const createSpy = jest.spyOn(InjectionFacade, 'create')
    const constructors = {
      TestService,
      TestController,
    }

    bindExpressActions(module, constructors)

    expect(createSpy).toHaveBeenCalledTimes(2)
    expect(createSpy).toHaveBeenCalledWith(module, TestService, undefined)
    expect(createSpy).toHaveBeenCalledWith(module, TestController, undefined)
  })

  it('should pass bundle to InjectionGateway.create when provided', () => {
    const createSpy = jest.spyOn(InjectionFacade, 'create')
    const bundle = InjectionBundle.create({
      context: InjectionContext.create(),
      entries: [],
    })
    const constructors = {
      TestService,
    }

    bindExpressActions(module, constructors, bundle)

    expect(createSpy).toHaveBeenCalledWith(module, TestService, bundle)
  })

  it('should create enumerable properties', () => {
    const constructors = {
      TestService,
      TestController,
    }

    const actions = bindExpressActions(module, constructors)

    const descriptor1 = Object.getOwnPropertyDescriptor(actions, 'TestService')
    const descriptor2 = Object.getOwnPropertyDescriptor(actions, 'TestController')

    expect(descriptor1?.enumerable).toBe(true)
    expect(descriptor2?.enumerable).toBe(true)
  })

  it('should create non-configurable properties', () => {
    const constructors = {
      TestService,
    }

    const actions = bindExpressActions(module, constructors)

    const descriptor = Object.getOwnPropertyDescriptor(actions, 'TestService')

    expect(descriptor?.configurable).toBe(false)
  })

  it('should create working gateway methods', () => {
    const constructors = {
      TestService,
    }

    const actions = bindExpressActions(module, constructors)

    const result = actions.TestService.getData()

    expect(result).toBe('Hello from TestDependency')
  })

  it('should handle async methods', async () => {
    const constructors = {
      TestService,
    }

    const actions = bindExpressActions(module, constructors)

    const result = await actions.TestService.getDataAsync()

    expect(result).toBe('async data')
  })

  it('should handle methods with arguments', () => {
    const constructors = {
      TestService,
    }

    const actions = bindExpressActions(module, constructors)

    const result = actions.TestService.calculate(5, 3)

    expect(result).toBe(8)
  })

  it('should return empty object when no constructors provided', () => {
    const constructors = {}

    const actions = bindExpressActions(module, constructors)

    expect(actions).toEqual({})
  })
})

