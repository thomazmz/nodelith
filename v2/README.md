# @nodelith/injection

A flexible and lightweight dependency injection library for JavaScript and TypeScript. Resolve complex dependency graphs using classes, factories, functions, or static values. Manage dependency visibility and lifecycles with ease. Build composable, reusable modules for clean and maintainable architectures.

## 📦 Installation

```bash
npm install @nodelith/injection
```

## 🚀 Quick Example

**Say you have a small program to put together:**

```typescript
class Logger {
  public info(message: string) {
    console.info(message)
  }
}

class Database {
  public constructor(
    private database: string = 'default_database',
    private logger: Logger,
  ) {}

  public async save(username: string) {
    this.logger.info(`Saving user: ${username} to ${this.database}`)
  }
}

class UserService {
  public constructor(
    private logger: Logger,
    private database: Database,
  ) {}

  public async create(username: string) {
    this.logger.info(`Creating user: ${username}`)
    return await this.database.save(username)
  }
}
```

**All you need to do to wire everything up is:**

```typescript
// Import the Nodelith Container and set it up
import { Container } from '@nodelith/injection'
const container = Container.create()

// Register your dependencies:
container.register('logger', { constructor: Logger })
container.register('database', { constructor: Database })
container.register('userService', { constructor: UserService })
```

**Finally, resolve the wanted root dependency and use it:**

```typescript
// Resolve the desired dependency:
const userService = container.resolve('userService')

// Use the resolved dependency instance:
const user = await userService.create('johndoe')
// Logs: Creating user: johndoe
// Logs: Saving user: johndoe to default_database
```

**Not into classes? Inject dependencies from factories instead:**

```typescript
// Declare your factory so that it returns an object
function UserController(userService: UserService) {
  return {
    async create(request: { body: { username: string } }) {
      return userService.create(request.body.username)
    }
  }
}

// Register it under your container
container.register('userController', { factory: UserController })
```

**Need to inject static values? Just do it:**

```typescript
// Pass the static value under the registration options
container.register('database', { static: 'custom_database' })
```

**Want to make it composable? Use Modules:**

```typescript
// Instead of a Container, set up a Module
import { Module } from '@nodelith/injection'
const userModule = Module.create()

// Register your dependencies:
userModule.register('user', {
  static: 'myself',
  visibility: 'private'
})
userModule.register('database', {
  static: 'custom_database',
  visibility: 'private'
})
userModule.register('logger', {
  constructor: Logger,
  visibility: 'private'
})
userModule.register('database', {
  constructor: Database,
  visibility: 'private'
})
userModule.register('userService', {
  constructor: UserService,
  visibility: 'private'
})
userModule.register('userController', {
  factory: UserController,
  visibility: 'public'
})

// Import it within other Modules, exposing only the public registrations:
const applicationModule = Module.create()
applicationModule.import(userModule)
```
