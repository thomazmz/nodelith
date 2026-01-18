# @nodelith/injection

Composable, lightweight dependency injection for JavaScript/TypeScript. Build clear dependency graphs with classes, factories, functions, or static values, while keeping lifecycles and initialization explicit and easy to test.

---

## 📦 Installation

```bash
npm install @nodelith/injection
# or
pnpm add @nodelith/injection
# or
yarn add @nodelith/injection
```

---

## Quick Start

Start by creating a container, register the values/functions/classes/factories your app needs, then resolve by token when you want to use them. The example below wires a small user service with its repository and shows the minimum flow from registration to resolution.

```typescript
import { InjectionContainer } from '@nodelith/injection'

class UserRepository {
  public findById(id: string) {
    return { id }
  }
}

class UserService {
  public constructor(userRepository: UserRepository) {
    this.userRepository = userRepository
  }

  public getUser(id: string) {
    return this.userRepository.findById(id)
  }
}

const container = InjectionContainer.create()
container.mapClassRegistration('userRepository', UserRepository)
container.mapClassRegistration('userService', UserService)

const service = container.resolve('userService')
console.log(service.getUser('42'))
// > { id: 42 }
```

---

## Registrations

Registrations describe how a token should be resolved. There are four types of primitive registrations that can be created through this library: value (static values), function (plain functions), factory (functions returning objects), and class (constructors) registrations. Most of the time you create registrations via `map*Registration` on the container/module, but you can also create one in isolation and import it later.

```typescript
import { InjectionRegistration, InjectionContainer } from '@nodelith/injection'

const cachedValue = InjectionRegistration.createValueRegistration('token', { token: 'answer' })

const container = InjectionContainer.create()
container.useRegistration(cachedValue)
```

When adding a Registration to a Container, the Registration is automatically cloned, binding its copy to the Container's context and preventing any state from being shared across Containers.

---

## Lazy Resolution

Class and factory registrations are resolved through a lazy proxy. The underlying class/factory only runs when you access a property or call a method on the resolved value. This avoids eager instantiation and helps with some types of circular graphs.

Factory registrations are intended for object-producing functions and get the same lazy proxy behavior as classes, while function registrations return their value directly (no proxy), which is ideal for pure helpers or computed values.

```typescript
const createObject = () => {
  console.log('Object created!')
  return {
    sayHello(name: string) {
      console.log(`Hello, ${name}!`)
    },
  }
}

const container = InjectionContainer.create()

container.mapFactoryRegistration('factory', createObject)

const object = container.resolve('factory')

logger.info('Thom')
// > Object created!
// > Hello, Thom!
```

---

## Parameter Matching

Registrations created with `mapClassRegistration`, `mapFactoryRegistration`, and `mapFunctionRegistration` resolve dependencies by matching parameter names to registered tokens. At resolution time, the container builds a dependency bundle and passes values in the same order as the resolved parameter list.

> ⚠️ Parameter names must be stable at runtime; minification/obfuscation can break parameter/dependency matching.

When parameters are not stable at runtime (like after minification), you should either depend on the Bundle explicitly or pass `params` list to lock the injection order; 

```typescript
const createMailer = (smtpUrl: string, timeout: number) => {
  ...
}

container.mapFunctionRegistration('mailer', createMailer, {
  params: ['smtpUrl', 'timeout'],
})
```

---

## Lifetime Management

Registrations support three lifecycles:  

- `transient`: a new instance is created every time one is needed  
- `singleton`: a single instance is cached within the container  
- `scoped`: an instance is cached during resolution context  

---

## Visibility Management

Registrations support two visibility modes:  

- `public`: intended to be exposed outside the module/container boundary.  
- `private`: intended to stay internal to the module/container boundary.  

At the Container level, visibility represents metadata on the registration. The container does not change resolution behavior based on it, but it can be used by tooling or custom bundle logic to decide what should be exposed.

At the Module level, visibility is enforced by your module boundaries. Modules will not expose registrations from child Modules and will only expose registrations that are set public. Private registrations will only be exposed to registrations within the exact same Module a the registration belongs to.

```typescript
container.mapClassRegistration('dbClient', DbClient, {
  visibility: 'private',
})

container.mapClassRegistration('userService', UserService, {
  visibility: 'public',
})
```

---

## Module composition

Use `InjectionModule` to compose reusable sets of registrations.

```typescript
import { InjectionModule } from '@nodelith/injection'

const userModule = InjectionModule.create()
  .mapClassRegistration('userRepository', UserRepository)
  .mapClassRegistration('userService', UserService)

const appModule = InjectionModule.create()
  .mapValueRegistration('dbUrl', 'postgres://local')
  .useModule(userModule)

appModule.resolve('userService')
```

---

## Initialization pipeline

Initializers let you run setup logic before exposing values. This is particular usefull when stating up processes or applications. Implement `CoreInitializer` and register it via `InjectionInitializer`. Initializers run in the same order they were added to the container and one initializer can depend on the other as long as they are added on the correct order the Container/Module.

```typescript
import { InjectionContainer } from '@nodelith/injection'
import { CoreInitializer } from '@nodelith/core'

class CacheInitializer implements CoreInitializer<Set<string>> {
  public async initialize() {
    return ['Some', 'slow', 'operation'];
  }
}

function SomethingWithCache(cache: string[]) {
  return cache.join()
}

const container = InjectionContainer.create()
  .mapClassInitializer('cache', CacheInitializer)
  .mapFunctionRegistration('something', SomethingWithCache)

await container.initialize()
const cache = container.resolve('something')
```

---
