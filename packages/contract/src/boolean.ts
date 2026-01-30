import { CoreIssue } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class BooleanContract<S extends CoreContract.BooleanShape = CoreContract.BooleanShape, P extends CoreContract.Properties = CoreContract.Defaults> extends CoreContract<S, P> {
  public static create<S extends CoreContract.BooleanShape, const P extends CoreContract.Options>(options: P): BooleanContract<S, {
    readonly optional: P['optional'] extends boolean ? P['optional'] : false;
    readonly nullable: P['nullable'] extends boolean ? P['nullable'] : false;
  }>;

  public static create<S extends CoreContract.BooleanShape>(): BooleanContract<S, {
    readonly optional: false
    readonly nullable: false
  }>;

  public static create(options?: CoreContract.Options) {
    return new BooleanContract(options);
  }

  public clone<const Pp extends CoreContract.Options>(options?: Pp): BooleanContract<S, CoreContract.MergeOptions<P, Pp>> {
    return new BooleanContract({ ...this.properties, ...options });
  }

  public parse(input: unknown): CoreContract.Result<this> {
    if (input === null) {
      if (!this.properties.nullable) {
        return { success: false, issues: [CoreIssue.create("Invalid boolean input")] };
      }

      return { success: true, value: input } as CoreContract.Result<this>;
    }

    if (input === undefined) {
      if (!this.properties.optional) {
        return { success: false, issues: [CoreIssue.create("Invalid boolean input")] };
      }

      return { success: true, value: input } as CoreContract.Result<this>;
    }

    if (typeof input !== 'boolean') {
      return { success: false, issues: [CoreIssue.create("Invalid boolean input")] };
    }

    return { success: true, value: input } as CoreContract.Result<this>;
  }
}
