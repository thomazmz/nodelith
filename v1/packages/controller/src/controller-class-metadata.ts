import * as Types from '@nodelith/types';

export class ClassMetadata {

  public readonly path?: string;
  
  public readonly name?: string;
  
  public readonly description?: string;

  private static readonly METADATA_KEY = Symbol()

  public static attach(constructor: Types.Constructor, metadata: ClassMetadata): Types.Constructor {
    const currentMetadata: ClassMetadata = constructor[ClassMetadata.METADATA_KEY] ?? {};

    constructor[ClassMetadata.METADATA_KEY] = {
      path: metadata.path ?? currentMetadata.path,
      name: metadata.name ?? currentMetadata.name,
      description: metadata.description ?? currentMetadata.description,
    };

    return constructor
  }

  public static extract(constructor: Types.Constructor): ClassMetadata {
    return {
      ...constructor[ClassMetadata.METADATA_KEY]
    }
  }
}