import { ControllerRouteMetadata, Path, Method, SuccessResponse, Summary, Description, Operation } from './controller-route-metadata'

jest.mock('@nodelith/http', () => ({
  HttpStatus: { Ok: 200, Created: 201 },
  HttpMethod: { Get: 'get', Post: 'post' },
}))

describe('ControllerRouteMetadata', () => {
  const descriptor: TypedPropertyDescriptor<any> = {
    value: function handler() {},
  }

  it('attaches and extracts route metadata', () => {
    ControllerRouteMetadata.attach(descriptor, { path: '/x', method: 'get' as any, key: 'handler' })
    ControllerRouteMetadata.attach(descriptor, { success: 200 as any, summary: 'sum', description: 'desc', operation: 'op' })

    expect(ControllerRouteMetadata.extract(descriptor)).toEqual({
      path: '/x',
      method: 'get',
      key: 'handler',
      success: 200,
      summary: 'sum',
      description: 'desc',
      operation: 'op',
    })
  })

  it('decorators set individual fields', () => {
    const desc: TypedPropertyDescriptor<any> = { value: function demo() {} }

    Path('/y')(undefined as any, 'demo', desc)
    Method('post' as any)(undefined as any, 'demo', desc)
    SuccessResponse(201 as any)(undefined as any, 'demo', desc)
    Summary('s')(undefined as any, 'demo', desc)
    Description('d')(undefined as any, 'demo', desc)
    Operation('op')(undefined as any, 'demo', desc)

    expect(ControllerRouteMetadata.extract(desc)).toMatchObject({
      path: '/y',
      method: 'post',
      success: 201,
      summary: 's',
      description: 'd',
      operation: 'op',
    })
  })
})

