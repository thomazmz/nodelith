import { Utils } from '@refresh/framework/utils';
import { HttpStatus } from '@refresh/framework/http';
import { HttpMethod } from '@refresh/framework/http';
import { ControllerInputMetadata } from './controller-input-metadata';
import { ControllerRouteMetadata } from './controller-route-metadata';
import { ControllerRouterMetadata } from './controller-router-metadata';

export type ControllerRootMetadata = ControllerRouterMetadata & {
  readonly path: string,
  readonly routes: (ControllerRouteMetadata & {
    readonly inputs: ControllerInputMetadata
    readonly success: HttpStatus
    readonly method: HttpMethod
    readonly path: string,
    readonly key: string,
  })[]
}

export const ControllerRootMetadata = Object.freeze({
  extract: extractControllerRootMetadata
})

export function extractControllerRootMetadata(controller: Utils.Constructor): ControllerRootMetadata {
  const routerMetadata = ControllerRouterMetadata.extract(controller)

  const routerMembers = Utils.Object.extractMembers(controller.prototype).filter((member) => {
    return !Utils.Object.isConstructorMember(member)
      && Utils.Object.isFunctionMember(member)
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
