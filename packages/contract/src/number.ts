import { CoreIssue } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class NumberContract<S extends CoreContract.NumberShape = CoreContract.NumberShape, P extends CoreContract.Properties = CoreContract.Defaults> extends CoreContract<S, P> {
  public static create<S extends CoreContract.NumberShape, const P extends CoreContract.Options>(options: P): NumberContract<S, {
    readonly optional: P['optional'] extends boolean ? P['optional'] : false;
    readonly nullable: P['nullable'] extends boolean ? P['nullable'] : false;
  }>;

  public static create<S extends CoreContract.NumberShape>(): NumberContract<S, {
    readonly optional: false
    readonly nullable: false
  }>;

  public static create(options?: CoreContract.Options) {
    return new NumberContract(options);
  }

  public clone<const Pp extends CoreContract.Options>(options?: Pp): NumberContract<S, CoreContract.MergeOptions<P, Pp>> {
    return new NumberContract({ ...this.properties, ...options });
  }

  public parse(input: unknown): CoreContract.Result<this> {
    if (input === null && !this.properties.nullable) {
      if (!this.properties.nullable) {
        return { success: false, issues: [CoreIssue.create("Invalid number input")] };
      }

      return { success: true, value: input } as CoreContract.Result<this>;
    }

    if (input === undefined) {
      if (!this.properties.optional) {
        return { success: false, issues: [CoreIssue.create("Invalid number input")] };
      }

      return { success: true, value: input } as CoreContract.Result<this>;
    }

    if (typeof input !== 'number') {
      return { success: false, issues: [CoreIssue.create("Invalid number input")] };
    }

    return { success: true, value: input } as CoreContract.Result<this>;
  }
}
