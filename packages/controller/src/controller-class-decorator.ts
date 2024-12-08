import * as Types from '@nodelith/types'
import * as Controller from './controller-class-metadata';

export function Path<Result extends Types.ConstructorResult, Args extends any[]>(path: string) {
  return (constructor: Types.Constructor<Result, Args>) => {
    Controller.ClassMetadata.attach(constructor, { path })
    return constructor;
  };
}
