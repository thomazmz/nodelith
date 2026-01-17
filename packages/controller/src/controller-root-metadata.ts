import { HttpStatus } from '@nodelith/http'
import { HttpMethod } from '@nodelith/http'
// import { Contract } from '@nodelith/contract'
import { ObjectUtils } from '@nodelith/utilities'
import { ConstructorType } from '@nodelith/utilities'
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
    // readonly response?: Contract,
    // readonly header?: Contract,
    // readonly query?: Contract,
    // readonly body?: Contract,
  })[]
}

export const ControllerRootMetadata = Object.freeze({
  extract: extractControllerRootMetadata
})

export function extractControllerRootMetadata(controller: ConstructorType): ControllerRootMetadata {
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
