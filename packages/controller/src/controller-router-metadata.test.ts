import { ControllerRouterMetadata, Router, Name } from './controller-router-metadata'

describe('ControllerRouterMetadata', () => {
  it('attaches and extracts router metadata', () => {
    class Demo {}
    ControllerRouterMetadata.attach(Demo, { name: 'DemoCtrl', path: '/demo' })

    expect(ControllerRouterMetadata.extract(Demo)).toEqual({
      name: 'DemoCtrl',
      path: '/demo',
    })
  })

  it('decorators set name and path', () => {
    @Router('/api')
    @Name('ApiController')
    class Api {}

    expect(ControllerRouterMetadata.extract(Api)).toEqual({
      name: 'ApiController',
      path: '/api',
    })
  })
})

