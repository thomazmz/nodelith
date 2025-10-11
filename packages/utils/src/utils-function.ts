import * as acorn from 'acorn'

export type UtilsFunction<R = any, P extends Array<any> = any[]> = (...args: P) => R

export declare namespace UtilsFunction {
  export type Return<F extends UtilsFunction> = ReturnType<F>
  export type  Prameters<F extends UtilsFunction> = Parameters<F>
}

export const UtilsFunction = Object.freeze({
  extractParameters(target: UtilsFunction): string[] {
    const code = Function.prototype.toString.call(target).trim();

    // Try wrapping the target as function
    try {
      // Wrapping the code into parenthesis makes sure
      // both regular and arrow function expressions
      // are parsed correctly.
      const envelope = `(${code})`;

      const program = acorn.parse(envelope, {
        // This should reflect the ECMA Script version used by the
        // typescript.config files across the codebase
        ecmaVersion: 2022
      }) as any;

      const statement = program.body[0];
      const expression = statement.expression;

      // We can not continue in case the AST parsed code
      // does not yield a valid expression.
      if (!expression) {
        throw new Error('The provided function code could not be parsed into an AST expression');
      }

      // We can not continue in case the AST parsed
      // code does not yield a valid function expression.
      if (expression.type !== 'FunctionExpression' && expression.type !== 'ArrowFunctionExpression') {
        throw new Error('The provided function code could not be parsed into a function AST expression');
      }

      // Extract parameter code slices from the expression.
      return expression.params.map((parameter: any) => {
        return envelope.slice(parameter.start, parameter.end);
      });
    } catch { /* fall through */ }
    
    // Try wrapping the target as method
    try  {
      // Wrapping the code into an object literal allows
      // parsing of object method shorthand syntax.
      const envelope = `({ ${code} })`;

      const program = acorn.parse(envelope, {
        // This should reflect the ECMA Script version used by the
        // typescript.config files across the codebase
        ecmaVersion: 2022
      }) as any;

      const statement = program.body[0];
      const expression = statement.expression;

      // We can not continue in case the AST parsed code
      // does not yield a valid expression.
      if (!expression) {
        throw new Error('The provided function code could not be parsed into an AST expression');
      }

      // We can not continue in case the AST parsed code
      // does not yield a valid object expression.
      if (!(expression.type === 'ObjectExpression')) {
        throw new Error('The provided function code could not be parsed into a function AST expression');
      }
      // Locate the first property whose value is either a normal
      // function expression or an arrow function expression.
      const property = expression.properties.find((property: any) => {
        return (property.type === 'Property') && (
          property.value.type === 'FunctionExpression' 
            || property.value.type === 'ArrowFunctionExpression'
        );
      });

      // Extract parameter code slices from the property value.
      return property?.value?.params.map((parameter: any) => {
        return envelope.slice(parameter.start, parameter.end);
      }) ?? [];
    } catch { /* fall through */ }

    throw new Error('Could not parse target. The provided target is not a valid function.');
  },
})
