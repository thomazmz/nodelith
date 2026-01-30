import { CoreIssue } from '@nodelith/core'
import { CoreContract } from '@nodelith/core'

export class StringContract<S extends CoreContract.StringShape = CoreContract.StringShape, P extends CoreContract.Properties = CoreContract.Defaults> extends CoreContract<S, P> {
  public static create<S extends CoreContract.StringShape, const P extends CoreContract.Options>(options: P): StringContract<S, {
    readonly optional: P['optional'] extends boolean ? P['optional'] : false;
    readonly nullable: P['nullable'] extends boolean ? P['nullable'] : false;
  }>;

  public static create<S extends CoreContract.StringShape>(): StringContract<S, {
    readonly optional: false
    readonly nullable: false
  }>;

  public static create(options?: CoreContract.Properties) {
    return new StringContract(options);
  }

  public clone<const Pp extends CoreContract.Options>(options?: Pp): StringContract<S, CoreContract.MergeOptions<P, Pp>> {
    return new StringContract({ ...this.properties, ...options });
  }

  public parse(input: unknown): CoreContract.Result<this> {
    if (input === null && !this.properties.nullable) {
      if (!this.properties.nullable) {
        return { success: false, issues: [CoreIssue.create("Invalid string input")] };
      }

      return { success: true, value: input } as CoreContract.Result<this>;
    }

    if (input === undefined) {
      if (!this.properties.optional) {
        return { success: false, issues: [CoreIssue.create("Invalid string input")] };
      }

      return { success: true, value: input } as CoreContract.Result<this>;
    }

    if (typeof input !== 'string') {
      return { success: false, issues: [CoreIssue.create("Invalid string input")] };
    }

    return { success: true, value: input } as CoreContract.Result<this>;
  }
}
