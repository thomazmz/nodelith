import { ControllerRootMetadata } from './controller-root-metadata'
import { Router, Path, Method, SuccessResponse, Summary } from './controller'

jest.mock('@nodelith/http', () => ({
  HttpStatus: { Ok: 200, Created: 201, NoContent: 204 },
  HttpMethod: { Get: 'get', Post: 'post' },
}))

describe('ControllerRootMetadata', () => {
  it('extracts router metadata and routes with defaults', () => {
    @Router('/api')
    class Sample {
      @Path('/ping')
      ping() {}
    }

    const root = ControllerRootMetadata.extract(Sample)

    expect(root.path).toBe('/api')
    expect(root.name).toBe('Sample')
    expect(root.routes).toHaveLength(1)
    expect(root.routes[0]).toMatchObject({
      path: '/ping',
      method: 'get',
      success: 200,
      key: 'ping',
    })
    expect(root.routes[0].inputs).toEqual({})
  })

  it('respects explicit route metadata', () => {
    @Router('/api')
    class Sample {
      @Path('/users')
      @Method('post' as any)
      @SuccessResponse(201 as any)
      @Summary('Create user')
      create(name: string) {
        return name
      }
    }

    const root = ControllerRootMetadata.extract(Sample)
    expect(root.routes[0]).toMatchObject({
      path: '/users',
      method: 'post',
      success: 201,
      key: 'create',
      summary: 'Create user',
      inputs: { 0: 'name' },
    })
  })
})

