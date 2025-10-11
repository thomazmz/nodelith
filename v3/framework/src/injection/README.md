## Injection

Decorator-free dependency injection. Module composition, lifecycle management, scoped resolution, async initializers, and a flexible provisioning for parameter or bundle access.

This library is designed for backend services. Parameter-name provision relies on source code parameter names and should not be used with code minification/obfuscation. If you need to minify, use bundle provision or identity tokens instead.

### Features
- **Containers**: Registry for simple dependency craddles.  
- **Modules**: Registry for complex composable dependency trees.  
- **Different Registration Types**: values, functions, factories, and classes.  
- **Lifecycles**: `singleton`, `scoped`, `transient`.
- **Provision**: inject dependencies by `parameter` name or via a `bundle` object.
- **Initializers**: async bootstrapping and teardown that produce registrations.
- **Scoping**: per-request/custom scopes via `InjectionContext`.
- **Cycle detection**: Identify unresovable cyclic dependency trees.

## Quick start

```ts
import { Module } from './injection'

// Create a root module
const root = Module.create()

// Declare your dependencies
class Logger { 
  private readonly prefix: string

  public constructor(config: { level: string }) {
    this.prefix = config.level
  }

  public log(message: string) {
    console.log(`[${this.prefix}]: ${message}`)
  }
}

// Register as many classes, factories, functions and values as you want
root.registerValue('config', { prefix: 'InjectionServer' })
root.registerClass('logger', Logger)

// Resolve the wanted dependency instance
const logger = root.resolve('logger')

// Use the resolved instance
logger.log('My Message!') // [InjectionServer]: My Message!
```

## Core concepts

- **Registration type**:
  - `values` Values are any assignable values from primitives to functions and complex objects
  - `functions` Functions are capable of receiving an dependencies, processing them, and returning a value
  - `factories` Factories are intitled to receive dependencies and return complex object entities
  - `class` ES6 classes receives dependencies through constructors and return class instances

- **Lifecycle mode**:
  - `singleton` (default): will resolve only once within the same container/module
  - `transient`: Will resolve again everytime requested, even within the same resolution call
  - `scoped`: Will resolve once per resolution call

- **Provision mode**:
  - `parameters` (default): matches constructor/function parameter names against the bundle
  - `bundle`: pass the bundle object as the first and only argument

- **Visibility mode**: 
  - `public` (default) Surfaces across modules
  - `private` Stays limited within the assigned module

- **Resolution mode**: 
  - `proxy` (default for factories and classes) Surfaces across modules
  - `eager` (default for functions and enforced for values) Stays limited within the assigned module

- **Registries**:
  - `Container`: Owns registrations and resolves them.
  - `Module`: Aggregate other modules and orchestrate async initializers.

- **Token**: a key identifying a registration in a container/module. 

- **Bundle**: a lazy object exposing tokens as properties. Reading a property triggers resolution of that dependency.

- **Identity**: an unique identity assigned to each target (function/factory/class) registered on the container/module

- **Context**: Manages resolution cache per target identity; use it for scoped and singleton lifetimes.

- **Initializer**: an async bootstrap that yields a registration to be used later.

# TODO
[ ] Prevent access to unresovable tokens (should be implemented as part of injection-bundle.ts)  
[ ] Proxy injection (configuration is in place, to be added under injection-registration.ts)  
[ ] Decorator bindings (likely not wanted but could be added as an optional alternative)  
[ ] Caching bundle resolution (not functional, but likely to improve resolution speed)  
[ ] Trace resolution stack during initialization to avoid cyclic dependencies  
[ ] Track initialization state to prevent registrations after initialization  