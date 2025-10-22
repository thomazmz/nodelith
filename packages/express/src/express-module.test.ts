import crypto from 'crypto'
import express from 'express'
import request from 'supertest'
import { HttpMethod } from '@nodelith/http'
import { HttpStatus } from '@nodelith/http'
import { Controller } from '@nodelith/controller'
import { ExpressModule } from './express-module'

class TestDependency {
  public getMessage(): string {
    return 'Hello from dependency'
  }
}

class TestService {
  constructor(private dependency: TestDependency) {}

  public getId(): string {
    return crypto.randomUUID()
  }

  public getData(): string {
    return this.dependency.getMessage()
  }
}

@Controller.Router('/users')
class TestUsersController {
  constructor(private service: TestService) {}

  @Controller.Path('/')
  @Controller.Method(HttpMethod.Get)
  public getUsers() {
    return { users: ['Alice', 'Bob'], service: this.service.getData() }
  }

  @Controller.Path('/:id')
  @Controller.Method(HttpMethod.Get)
  public getUserById(id: string) {
    return { id, name: `User ${id}` }
  }

  @Controller.Path('/')
  @Controller.Method(HttpMethod.Post)
  @Controller.Success(HttpStatus.Created)
  public createUser(body: { name: string }) {
    return { id: '123', name: body.name }
  }

  @Controller.Path('/search')
  @Controller.Method(HttpMethod.Get)
  public searchUsers(query: { term: string }) {
    return { results: [`Result for: ${query.term}`] }
  }

  @Controller.Path('/auth')
  @Controller.Method(HttpMethod.Get)
  public authenticatedRoute(headers: { authorization: string }) {
    return { token: headers.authorization }
  }

  @Controller.Path('/no-content')
  @Controller.Method(HttpMethod.Delete)
  @Controller.Success(HttpStatus.NoContent)
  public deleteUser() {
    return undefined
  }
}

@Controller.Router('/products')
class TestProductController {
  @Controller.Path('/')
  @Controller.Method(HttpMethod.Get)
  public getProducts() {
    return { products: ['Product A', 'Product B'] }
  }
}

describe('ExpressModule', () => {
  it('should create a new express module instance', () => {
    const module = ExpressModule.create()

    expect(module).toBeDefined()
    expect(module).toBeInstanceOf(ExpressModule)
  })

  it('should add a controller', () => {
    const module = ExpressModule.create()

    const result = module.useController(TestUsersController)

    expect(result).toBe(module)
  })

  it('should add multiple controllers via chaining', () => {
    const module = ExpressModule.create()

    const result = module
      .useController(TestUsersController)
      .useController(TestProductController)

    expect(result).toBe(module)
  })

  it('should resolve application with routes from controller', async () => {
    const module = ExpressModule.create()

    module.register('service', { class: TestService })
    module.register('dependency', { class: TestDependency })

    module.useController(TestUsersController)

    const application = module.resolveApplication()

    const response = await request(application).get('/users')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      users: ['Alice', 'Bob'],
      service: 'Hello from dependency'
    })
  })

  it('should resolve router with routes from controller', async () => {
    const module = ExpressModule.create()
    module.register('dependency', { class: TestDependency })
    module.register('service', { class: TestService })
    module.useController(TestUsersController)

    const router = module.resolveRouter()

    const application = express().use(router)

    const response = await request(application).get('/users')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      users: ['Alice', 'Bob'],
      service: 'Hello from dependency'
    })
  })

  it('should handle path parameters', async () => {
    const module = ExpressModule.create()
    module.register('dependency', { class: TestDependency })
    module.register('service', { class: TestService })
    module.useController(TestUsersController)

    const app = module.resolveApplication()

    const response = await request(app).get('/users/42')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      id: '42',
      name: 'User 42'
    })
  })

  it('should handle POST requests with body parsing', async () => {
    const module = ExpressModule.create()
    module.register('dependency', { class: TestDependency })
    module.register('service', { class: TestService })
    module.useController(TestUsersController)

    const app = module.resolveApplication()

    const response = await request(app)
      .post('/users')
      .send({ name: 'Charlie' })

    expect(response.status).toBe(201)
    expect(response.body).toEqual({
      id: '123',
      name: 'Charlie'
    })
  })

  it('should handle query parameters', async () => {
    const module = ExpressModule.create()
    module.register('dependency', { class: TestDependency })
    module.register('service', { class: TestService })
    module.useController(TestUsersController)

    const app = module.resolveApplication()

    const response = await request(app).get('/users/search?term=john')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      results: ['Result for: john']
    })
  })

  it('should handle headers', async () => {
    const module = ExpressModule.create()
    module.register('dependency', { class: TestDependency })
    module.register('service', { class: TestService })
    module.useController(TestUsersController)

    const app = module.resolveApplication()

    const response = await request(app)
      .get('/users/auth')
      .set('authorization', 'Bearer token123')

    expect(response.status).toBe(200)
    expect(response.body).toEqual({
      token: 'Bearer token123'
    })
  })

  it('should handle NoContent status', async () => {
    const module = ExpressModule.create()
    module.register('dependency', { class: TestDependency })
    module.register('service', { class: TestService })
    module.useController(TestUsersController)

    const app = module.resolveApplication()

    const response = await request(app).delete('/users/no-content')

    expect(response.status).toBe(204)
    expect(response.body).toEqual({})
  })

  it('should handle multiple controllers with different routes', async () => {
    const module = ExpressModule.create()
    module.register('dependency', { class: TestDependency })
    module.register('service', { class: TestService })
    module.useController(TestUsersController)
    module.useController(TestProductController)

    const app = module.resolveApplication()

    const userResponse = await request(app).get('/users')
    const productResponse = await request(app).get('/products')

    expect(userResponse.status).toBe(200)
    expect(userResponse.body.users).toEqual(['Alice', 'Bob'])

    expect(productResponse.status).toBe(200)
    expect(productResponse.body.products).toEqual(['Product A', 'Product B'])
  })

  it('should create isolated resolution cycles per request', async () => {

    @Controller.Router('/identity')
    class TestIdentityController {
      constructor(private service: TestService) {}
    
      @Controller.Path('/')
      @Controller.Method(HttpMethod.Get)
      public getIdentity() {
        return this.service.getId()
      }
    }

    const module = ExpressModule.create()

    module.register('dependency', { class: TestDependency })
    module.register('service', { class: TestService })

    module.useController(TestIdentityController)

    const application = module.resolveApplication()

    const response1 = await request(application).get('/identity')
    const response2 = await request(application).get('/identity')
    const response3 = await request(application).get('/identity')

    expect(typeof response1.body).toBe('string')
    expect(typeof response2.body).toBe('string')
    expect(typeof response3.body).toBe('string')

    expect(response1.body).not.toBe(response2.body)
    expect(response1.body).not.toBe(response3.body)

    expect(response2.body).not.toBe(response1.body)
    expect(response2.body).not.toBe(response3.body)

    expect(response3.body).not.toBe(response1.body)
    expect(response3.body).not.toBe(response2.body)
  })
})

