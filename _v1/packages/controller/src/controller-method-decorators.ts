
import * as Http from '@nodelith/http';
import * as Controller from './controller-method-metadata'

export function Route(method: Http.Method, path?: string) {
  return (_: unknown, key: string, descriptor: PropertyDescriptor) => {
    return Controller.MethodMetadata.attach(descriptor, { method, path, key });
  };
}

export function Get(path?: string) {
  return Route(Http.Get, path ?? '/');
}

export function Delete(path?: string) {
  return Route(Http.Delete, path ?? '/');
}

export function Patch(path?: string) {
  return Route(Http.Patch, path ?? '/');
}

export function Put(path?: string) {
  return Route(Http.Put, path ?? '/');
}

export function Post(path?: string) {
  return Route(Http.Post, path ?? '/');
}

// export function Name(name: string) {
//   return (_: unknown, __: string, descriptor: PropertyDescriptor) => {
//     return ControllerMethodMetadata.attach(descriptor, { name });
//   };
// }

// export function Description(description: string) {
//   return (_: unknown, __: string, descriptor: PropertyDescriptor) => {
//     return ControllerMethodMetadata.attach(descriptor, { description });
//   };
// }
