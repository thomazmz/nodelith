import * as Http from '@nodelith/http';
import * as Types from '@nodelith/types';

export class MethodMetadata {

  protected static readonly METADATA_KEY = Symbol()

  public readonly key?: string | undefined;

  public readonly path?: string | undefined;
  
  public readonly method?: Http.Method | undefined;

  public readonly name?: string | undefined;

  public readonly description?: string | undefined;

  public static attach(
    descriptor: TypedPropertyDescriptor<Types.Function & { [MethodMetadata.METADATA_KEY]?: MethodMetadata}>,
    metadata: MethodMetadata,
  ): PropertyDescriptor {
    if (descriptor.value) {
      const currentMetadata = descriptor.value[MethodMetadata.METADATA_KEY]
      descriptor.value[MethodMetadata.METADATA_KEY] = { ...currentMetadata,
        key: metadata.key ?? currentMetadata?.key,
        name: metadata.name ?? currentMetadata?.name,
        path: metadata.path ?? currentMetadata?.path,
        method: metadata.method ?? currentMetadata?.method,
        description: metadata.description ?? currentMetadata?.description,
      }
    }

    return descriptor
  }

  public static extract(
    descriptor: PropertyDescriptor
  ): MethodMetadata {
    if (descriptor.value && descriptor.value[MethodMetadata.METADATA_KEY]) {
      return {
        key: descriptor.value[MethodMetadata.METADATA_KEY]?.key,
        name: descriptor.value[MethodMetadata.METADATA_KEY]?.name,
        path: descriptor.value[MethodMetadata.METADATA_KEY]?.path,
        method: descriptor.value[MethodMetadata.METADATA_KEY]?.method,
        description: descriptor.value[MethodMetadata.METADATA_KEY]?.description,
      };
    }

    return {}
  }
}
