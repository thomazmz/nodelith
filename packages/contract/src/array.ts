import { CoreIssue } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class ArrayContract<S extends CoreContract.ArrayShape = CoreContract.ArrayShape, P extends CoreContract.Properties = CoreContract.Defaults> extends CoreContract<S, P> {
  protected constructor(private readonly shape: S, options?: CoreContract.Options) {
    super(options)
  }

  public static create<S extends CoreContract.ArrayShape, const P extends CoreContract.Options>(shape: S, options: P): ArrayContract<S, {
    readonly optional: P['optional'] extends boolean ? P['optional'] : false;
    readonly nullable: P['nullable'] extends boolean ? P['nullable'] : false;
  }>;

  public static create<S extends CoreContract.ArrayShape>(shape: S): ArrayContract<S, {
    readonly optional: false
    readonly nullable: false
  }>;

  public static create<S extends CoreContract.ArrayShape>(shape: S, options?: CoreContract.Options) {
    return new ArrayContract(shape, options);
  }

  public clone<const Pp extends CoreContract.Options>(options?: Pp): ArrayContract<S, CoreContract.MergeOptions<P, Pp>> {
    return new ArrayContract(this.shape, { ...this.properties, ...options });
  }

  public parse(input: unknown): CoreContract.Result<this> {
    if (input === null) {
      if (!this.properties.nullable) {
        return { success: false, issues: [CoreIssue.create("Invalid array input")] };
      }

      return { success: true, value: input } as CoreContract.Result<this>;
    }
  
    if (input === undefined) {
      if (!this.properties.optional) {
        return { success: false, issues: [CoreIssue.create("Invalid array input")] };
      }

      return { success: true, value: input } as CoreContract.Result<this>;
    }

    if (typeof input !== "object" || !Array.isArray(input)) {
      return { success: false, issues: [CoreIssue.create("Invalid array input")] };
    }

    throw new Error('Method not implemented.')
  }
}
