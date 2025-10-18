import z from 'zod'
import { HttpStatus } from '@nodelith/http'
import { HttpMethod } from '@nodelith/http'
import { ObjectUtils } from '@nodelith/utils'
import { ConstructorUtils } from '@nodelith/utils'
import { ControllerInputMetadata } from './controller-input-metadata'
import { ControllerRouteMetadata } from './controller-route-metadata'
import { ControllerRouterMetadata } from './controller-router-metadata'

export type ControllerRootMetadata = ControllerRouterMetadata & {
  readonly path: string,
  readonly routes: (ControllerRouteMetadata & {
    readonly inputs: ControllerInputMetadata
    readonly success: HttpStatus
    readonly method: HttpMethod
    readonly path: string,
    readonly key: string,
    readonly response?: z.ZodJSONSchema,
    readonly header?: z.ZodJSONSchema,
    readonly query?: z.ZodJSONSchema,
    readonly body?: z.ZodJSONSchema,
  })[]
}

export const ControllerRootMetadata = Object.freeze({
  extract: extractControllerRootMetadata
})

export function extractControllerRootMetadata(controller: ConstructorUtils): ControllerRootMetadata {
  const routerMetadata = ControllerRouterMetadata.extract(controller)

  const routerMembers = ObjectUtils.extractMembers(controller.prototype).filter((member) => {
    return !ObjectUtils.isConstructorMember(member)
      && ObjectUtils.isFunctionMember(member)
  })

  const routerRoutes = routerMembers.map((member) => {
    const methodMetadata = ControllerRouteMetadata.extract(member)
    const inputMetadata = ControllerInputMetadata.extract(member)

    return { ...methodMetadata,
      success: methodMetadata.success ?? HttpStatus.Ok,
      method: methodMetadata.method ?? HttpMethod.Get,
      inputs: inputMetadata,
    }
  })

  return { ...routerMetadata,
    path: routerMetadata.path ?? '/',
    name: routerMetadata.name ?? controller.name,
    routes: routerRoutes.filter((metadata): metadata is ControllerRootMetadata['routes'][number] => {
      return !!metadata.path && !!metadata.key
    })
  }
}
