import * as Types from '@nodelith/types'
import * as Utilities from '@nodelith/utilities'

import { Token } from '../../token';
import { Bundle } from '../../bundle';
import { Access } from '../../access';
import { Lifetime } from '../../lifetime';
import { Registration } from '../registration'

import ts from 'typescript'

function extractParameterIdentifiers(target: Function): string[] {
  console.log(target.toString())
  const sourceFile = ts.createSourceFile(
    "target.ts",
    target.toString(),
    ts.ScriptTarget.Latest,
    true
  );

  let parameters: string[] = [];

  function extract(node: ts.Node) {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isArrowFunction(node) ||
      ts.isConstructorDeclaration(node) ||
      ts.isFunctionExpression(node)
    ) {
      parameters.push(...node.parameters.map(param => param.name.getText()));
    }

    ts.forEachChild(node, extract);
  }

  ts.forEachChild(sourceFile, extract);
  return parameters;
}

export type ConstructorRegistrationOptions = {
  bundle?: Bundle | undefined;
  token?: Token | undefined;
  access?: Access | undefined;
  lifetime?: Lifetime | undefined;
}

export class ConstructorRegistration<R extends object> implements Registration<R> {
  public static create<R extends object>(target: Types.Constructor<R>, options?: ConstructorRegistrationOptions): ConstructorRegistration<R> {
    return new ConstructorRegistration(target, options)
  }

  private readonly singleton: { resolution?: R } = { }

  private readonly target: Types.Constructor<R>

  public readonly access: Access

  private readonly bundle: Bundle

  public readonly lifetime: Lifetime

  public token: Token

  public constructor(target: Types.Constructor<R>, options?: ConstructorRegistrationOptions) {
    this.token = options?.token ?? Symbol()
    this.bundle = options?.bundle ?? {}
    this.access = options?.access ?? 'public'
    this.lifetime = options?.lifetime ?? 'singleton'
    this.target = target
  }

  public clone(bundle?: Bundle): Registration<R> {
    return new ConstructorRegistration<R>(this.target, {
      token: this.token,
      access: this.access,
      lifetime: this.lifetime,
      bundle,
    })
  }

  public resolve(bundle?: Bundle): R {
    if('resolution' in this.singleton) {
      return this.singleton.resolution
    }

    const resolutionBundle = this.createResolutionBundle(bundle)

    if(this.lifetime === 'singleton') {
      // const parameters = extractParameterIdentifiers(this.target)
      // const args = parameters.map(parameter => resolutionBundle[parameter])
      // return this.singleton.resolution = new this.target(...args)
      return this.singleton.resolution = new this.target(resolutionBundle)
    }

    return new this.target(resolutionBundle)
  };

  private createResolutionBundle(bundle: Bundle = {}): Bundle {
    return new Proxy(bundle, {
      ownKeys: (target) => {
        return [
          ...Reflect.ownKeys(this.bundle).filter(key => key !== this.token),
          ...Reflect.ownKeys(target).filter(key => key !== this.token),
        ];
      },
      getOwnPropertyDescriptor: (target, token) => {
        return token !== this.token ? (
          Reflect.getOwnPropertyDescriptor(this.bundle, token)
            ?? Reflect.getOwnPropertyDescriptor(target, token)
        ) : undefined
      },
      set: (_target: Bundle, token: Token) => {
        throw new Error(`Could not set bundle key "${token.toString()}". Targets are not allowed to assign bundle values.`)
      },
      get: (target, token) => {
        if(token  === this.token) {
          throw new Error(`Could not access bundle key "${token.toString()}". Target should not access its own token.`)
        }
        if(token in this.bundle) {
          return this.bundle[token]
        }
        return target[token]
      } 
    })
  }
}
