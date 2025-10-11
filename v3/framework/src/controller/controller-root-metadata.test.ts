import { HttpMethod } from '@refresh/framework/http'
import { HttpStatus } from '@refresh/framework/http'
import { Router } from './controller-router-metadata'
import { Name } from './controller-router-metadata'
import { Path } from './controller-route-metadata'
import { Method } from './controller-route-metadata'
import { Success } from './controller-route-metadata'
import { Summary } from './controller-route-metadata'
import { Operation } from './controller-route-metadata'
import { Description } from './controller-route-metadata'
import { ControllerRootMetadata } from './controller-root-metadata'

describe('ControllerAggregate', () => {
  it('should resolve default root metadata', () => {

    @Router('/routee')
    class SomeController {
      @Path('/barbarbar')
      public getBarById(headers: string, query: string, body: string, id: string) {
        throw new Error('Should not be called')
      }
    }

    const rootMetadata = ControllerRootMetadata.extract(SomeController)

    expect(rootMetadata.name).toEqual('SomeController')
    expect(rootMetadata.path).toEqual('/routee')

    expect(rootMetadata.routes?.[0]?.success).toEqual(HttpStatus.Ok)
    expect(rootMetadata.routes?.[0]?.method).toEqual(HttpMethod.Get)

    expect(rootMetadata.routes?.[0]?.description).toEqual(undefined)
    expect(rootMetadata.routes?.[0]?.operation).toEqual(undefined)
    expect(rootMetadata.routes?.[0]?.summary).toEqual(undefined)

    expect(rootMetadata.routes?.[0]?.path).toEqual('/barbarbar')
    expect(rootMetadata.routes?.[0]?.key).toEqual('getBarById')
    expect(rootMetadata.routes?.[0]?.inputs).toEqual({
      0: 'headers',
      1: 'query',
      2: 'body',
      3: 'id'
    })
  })

  it('should resolve explicit rootMetadata metadata', () => {

    @Name('SomeController')
    @Router('/routee')
    class SomeController {
      @Path('/foofoofoo')
      @Method(HttpMethod.Post)
      @Success(HttpStatus.Created)
      @Operation('CreateFoo')
      @Summary('Create Foo')
      @Description('Creates a nice foo.')
      public createFoo(headers: string, query: string, body: string, id: string) {
        throw new Error('Should not be called')
      }
    }

    const rootMetadata = ControllerRootMetadata.extract(SomeController);

    expect(rootMetadata.name).toEqual('SomeController')
    expect(rootMetadata.path).toEqual('/routee')

    expect(rootMetadata.routes?.[0]?.success).toEqual(HttpStatus.Created)
    expect(rootMetadata.routes?.[0]?.method).toEqual(HttpMethod.Post)

    expect(rootMetadata.routes?.[0]?.description).toEqual('Creates a nice foo.')
    expect(rootMetadata.routes?.[0]?.operation).toEqual('CreateFoo')
    expect(rootMetadata.routes?.[0]?.summary).toEqual('Create Foo')

    expect(rootMetadata.routes?.[0]?.path).toEqual('/foofoofoo')
    expect(rootMetadata.routes?.[0]?.key).toEqual('createFoo')
    expect(rootMetadata.routes?.[0]?.inputs).toEqual({
      0: 'headers',
      1: 'query',
      2: 'body',
      3: 'id'
    })
  });
});
