import { ZodType, z } from 'zod'
import { CoreConfig } from './core-config'
import { CoreValidator } from './core-validator'

export class CoreConfigValidator<T extends CoreConfig.Value> extends CoreValidator<T> {
  public static string(): CoreConfigValidator<string> {
    return new CoreConfigValidator(z.string());
  }

  public static number(): CoreConfigValidator<number> {
    return new CoreConfigValidator(z.number());
  }

  public static boolean(): CoreConfigValidator<boolean> {
    return new CoreConfigValidator(z.boolean());
  }

  private constructor(private readonly schema: ZodType<T>) {
    super()
  }

  public validate(value: unknown): readonly [T, undefined] | readonly [undefined, Error] {
    const result = this.schema.safeParse(value);
    return result.success 
      ? [result.data, undefined] as const
      : [undefined, result.error] as const
  }
}