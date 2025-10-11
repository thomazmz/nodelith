# @nodelith/injection

Flexible dependency injection library for JavaScript and TypeScript applications. Create *Registrations*, *Containers* and *Modules*, so that they a re resolved in runtime. Support different registration types such as static values, functions, factories and class constructors, allowing a variety of use cases for managing dependency injection.


## Table of Contents

- [Overview](#overview)
- [Quick Example](#quick-example)
- [Tokens](#tokens)
- [Bundle](#bundle)
- [Options](#options)
   - [options.token](#optionstoken)
   - [options.bundle](#optionsbundle)
   - [options.access](#optionsaccess)
   - [options.lifecycle](#optionslifecycle)
   - [options.mode](#optionsmode)
- [Registrations](#registrations)
   - [Static Registrations](#static-registrations)
   - [Function Registrations](#function-registrations)
   - [Factory Registrations](#factory-registrations)
   - [Constructor Registrations](#constructor-registrations)
- [Standalone Registrations](#standalone-registrations)
   - [Standalone Static Registration](#standalone-static-registration)
   - [Standalone Function Registration](#standalone-function-registration)
   - [Standalone Factory Registration](#standalone-factory-registration)
   - [Standalone Constructor Registration](#standalone-constructor-registration)

## Installation
```bash
npm install  @nodelith/injection
```

## Importing
```typescript
import * as Injection from '@nodelilth/injection'
```

## Usage Example

```typescript

// Lets start declaring a Module to manage our Dummy domain
const dummyModule = new Injection.Module()

interface DummyRepositoryInterface {
  findById(id: string): Promise<Dummy>
}

class DummyService {
  public constructor(
    // We can reference the interface here as it doesn't exist in runtime
    private readonly dummyRepository: DummyRepositoryInterface,
    private readonly dummyRepository: DummyRepositoryInterface,
  ) {}

  public getDummyById(id: string) {
    const dummy = this.dummyRepository.findById(id)

    if(!dummy) {
      throw new Error('Could not find Dummy!')
    }

    return dummy
  }
}

// To register our DummyService we can use the Module:register method
// We could also use the Module:registerClass method to achieve the same result
dummyModule.register('dummyService', {
  constructor: DummyService,

  // We need to explicitly make this registration 'transient'
  // This ensures it will generate one new DummyService in every resolution
  lifetime: 'transient',

  // Lets explicitly make the injection mode 'spread' (this is also the default)
  // This ensures the factory dependencies will be injected as parameters 
  mode: 'spread',
})

// Lets now declare another Module to manage our infrastructure dependencies
const infrastructureModule = new Injection.Module()

// The following will be our logger class
class Logger {
  // We  want each logger to have a unique UUID associated to it
  private uuid = crypto.randomUUID()

  public error(message: string) {
    // Then we can use the UUID when logging
    // This ensures we know from which logger the error is coming from
    console.error(`[${this.uuid}]: ${message}`)
  }

  public info(message: string) {
    // The same can be done for logging informational messages
    console.info(`[${this.uuid}]: ${message}`)
  }
}

// To register our "Logger" we can use the Module:register method
// We could also use the Module:registerClass method to achieve the same result
infrastructureModule.register('logger', {

  // We need to explicitly make the Logger registration "transient"
  // This way, we ensure a new Logger instance will be created for each resolution
  lifetime: 'transient',

  // Using the "constructor" key here flags the type of our registration
  // This is important because "Logger" is a class constructor 
  constructor: Logger,
})

// This is our database Initializer class
// Initializers work a bit different than other registrations
//  - They should return an object with an async "initialize" method 
//  - They can optionally return an async "terminate" method 
//  - They are resolved and initialized when Module:initialize is called
//  - They are terminated when Module:terminate is called
class DatabaseInitializer  {
  private readonly connectionString: string
  private readonly connectionTimeout: number
  
  // Although Initializers behave differently, constructing then is not different from other registrations
  // Here we expect the container to pass the dependencies as a bundle
  public constructor(bundle: {
    // In practice, the bundle will allow access to any dependency on the container
    // However, we can use TypeScript to limit usage to only the "config" registration
    config: DatabaseConfig
  }) {
    this.connectionString = bundle.config.connectionString
    this.connectionTimeout = bundle.config.connectionTimeout
  }

  // This is a required method declaration for initializers
  // The associated Module will call this method as part of Module:initialize
  public async initialize(): Promise<Database> {
    // We need to be a bit creative here
    // Just imagine that we are using your preferred database library here
    return yourPreferredDatabaseLibrary.connect({
      connectionString: this.connectionString,
      connectionTimeout: this.connectionTimeout,
    })
  }

  // This is an optional method declaration
  // The associated Module will call this method as part of Module:terminate
  // In this  case, it is convenient to ensure our database connection will be closed 
  public terminate(): Promise<void> {
    // As above, just imagine that we are using your preferred database library here
    await yourPreferredDatabaseLibrary.close()
  }
}

// To register our "DatabaseInitializer" we can use the Module:registerInitializer method
// We could also use the Module:registerInitializerConstructor method to achieve the same result
infrastructureModule.registerInitializer('database', {

  // Lets make this registration 'singleton' (this is also the default)
  // This way, we will share only one instance of the class among all resolutions
  lifetime: 'singleton',

  // Using the "constructor" key here flags the type of our registration
  // This is important because "DatabaseInitializer" is a class constructor 
  constructor: DatabaseInitializer,
})


// This is our repository class implementation
class DummyRepositoryImplementation implements DummyRepositoryInterface {
  private readonly database: Database

  // We are destructuring the bundle here to obtain the database object
  public constructor({ database }: { database: Database }) {
    this.database = database
  }

  public findById(id: string) {
    // This is also just illustrative
    return this.database.query(`
      SELECT * FROM dummies WHERE id = ${id}
    `)
  }
}

// To register our "DummyRepositoryImplementation" we can use the Module:register method
// We could also use the Module:registerConstructor method to achieve the same result
infrastructureModule.register('dummyRepository', {

  // Lets explicitly make this registration 'singleton' (this is also the default)
  // This way, we will share only one instance of this class among all resolutions
  lifetime: 'singleton',

  // Using the "constructor" key here flags the type of our registration
  // This is important because "DatabaseInitializer" is a class constructor 
  constructor: DatabaseInitializer,
})

```

## Concepts

### Tokens

A token is a identifier used to register and resolve dependencies. It acts as a key in a key-value pair, where the key (the token) maps to a specific dependency (the value). They allow binding dependencies and ensure they are uniquely identified within the a single Container/Module.

### Bundles

A bundle is a way to group multiple resolutions together and inject them as a single parameter. Bundles are declared as part of Container interfaces, aggregating resolutions as an immutable key-value *object*.

### Containers

Containers are capable of managing standalone registration intake, resolution, scoping, and unpacking, while safely exposing their resolutions  through a Bundle property. Containers are considered to be lower level implementations in comparison to Modules and their usage will require declaring standalone registrations.

```typescript
const injectionContainer = new Injection.Container()
```

### Modules 

Modules are designed to allow easy integration with other parts of an application while maintaining separation of concerns. Under the hood, a Module object will encapsulate a Container object, grouping a set of dependencies and offering functionalities such as async initialization methods, visibility layers, and higher level checks to prevent token override. 

```typescript
const injectionModule = new Injection.Module()
```

### Registrations


Registrations are the mechanism through which dependencies are introduced into a bundle. Each registration associates a unique token with a specific target type (e.g., static value, function, factory, or constructor) and defines how the dependency will be resolved, accessed, and managed within the container/module. 

The easiest way to create registrations is to use the Module instance methods available. 

```typescript
injectionModule.registerStatic('fistName', 'John')

injectionModule.registerStatic('lastName', 'John')

injectionModule.registerFactory('person', (firstName, lastName) => {
  return {
    firstName: bundle.firstName
    lastName: bundle.lastName
    get fullName() {
      return `${bundle.firstName} ${bundle.lastName}`
    }
  }
})
```

You can also use standalone Registrations in conjunction with Containers. Check the documentation covering standalone Registrations in detail [here]().

```typescript
const firstNameRegistration = Injection.Registration.create({
  token: 'firstName'
  static: 'John'
})

const lastNameRegistration = Injection.Registration.create({
  token: 'lastName'
  static: 'Dow'
})

const personRegistration = Injection.Registration.create({
  token: 'person',
  factory: (firstName, lastName) => ({
    firstName: bundle.firstName
    lastName: bundle.lastName
    get fullName() {
      return `${bundle.firstName} ${bundle.lastName}`
    }
  })
})

container.push(
  firstNameRegistration,
  lastNameRegistration,
  personRegistration,
)
```


### Options

Options are values that can be passed to customize/configure dependency injection behavior across Modules, Containers and Registrations. These options control how dependencies are accessed, resolved, and injected.

#### **`options.visibility`** 

Sets the visibility of the registered dependency. visibility is defined as *public* when not explicitly provided and are only assigned when a registration is successfully pushed to a Module. Standalone registrations will not hold/enforce a visibility property.

| Visibility              | Description                                                        |
|-------------------------|--------------------------------------------------------------------|
| **public** (default)    | Accessible by all modules/dependencies on the bundle.              |
| **private**             | Only accessible by dependencies within the same module.            |

#### **`options.lifecycle`**

Determines the injection lifecycle of the registered dependency. Injection lifecycle is defined as *singleton* when not explicitly provided. This option does not have any effect over [static registrations](#static-registrations).

| Lifecycle               | Description                                                       |
|-------------------------|-------------------------------------------------------------------|
| **singleton** (default) | A single instance is shared across all dependencies.              |
| **transient**           | A new instance is created each time a dependency requires it.     |

#### **`options.mode`**

Determines the injection mode to be used when passing dependencies to the registration target. Injection mode is defined as *positional* when not explicitly provided. This option does not have any effect over [static registrations](#static-registrations). 

| Mode                     | Description                                                   |
|--------------------------|---------------------------------------------------------------|
| **positional** (default) | Resolutions are injected in positional order.                 |
| **bundle**               | Resolutions are injected as a bundle object.                  |

### Registration Strategies

#### **`Static Registrations`**

Represents a fixed/immutable value that will remain static during program runtime. Consider that "value types" (such as strings and numbers) will remain absolutely unchanged, while "reference types" (such as objects and arrays) will remain unchanged to the extent of their references. E.g.: An object registered as a static target will maintain its reference in memory, while its properties/methods might change during program runtime. Static targets are never proxied.

```typescript
// will provide "John" as a string
someModule.register('firstName', { static: 'John' })

// will provide "Doe" as a string
someModule.registerStatic('lastName', 'Doe')
```
    
#### **`Function Registrations`**

Represents a traditional function responsible for dynamically construct and return values. Function targets are fully configurable and can construct any type of dependency, including numbers, strings, complex objects and so on. The resolution obtained from function targets are never proxied.

```typescript
// will provide "John Doe" as a string
someModule.register('name', { function: (firstName, lastName) => {
  return `${firstName} ${lastName}` 
}})

// Wil provide { name: "John Doe" } directly
someModule.registerFunction('name', (firstName, lastName) => {
  return { name: `${firstName} ${lastName}` }
})
```

#### **`Factory Registrations`**

Represents a factory function responsible for dynamically creating and returning objects. Factories cannot be used  to construct value types such as strings and numbers. The resolution obtained from factory targets are always proxied.

```typescript
// Wil provide { name: "John Doe" } wrapped within a proxy
someModule.register('wrapper', { factory: (firstName, lastName) => {
  return { name: `${firstName} ${lastName}` }
}})

// Will provide { name: "John Doe" } wrapped within a proxy
someModule.registerFactory('wrapper', (firstName, lastName) => {
  return { name: `${firstName} ${lastName}` }
})
```

#### **`Constructor Registrations`**

Represents a constructor function used to instantiate objects through the `new` keyword.  Constructors allow for leveraging class-based patterns, where instances are created with a specific structure and behavior. The resolution obtained from constructor targets are always proxied.

```typescript
// Will provide { name: "John Doe" } wrapped within a proxy
someModule.register('wrapper', { constructor: class { 
  constructor(firstName, lastName) {
    this.name = `${firstName} ${lastName}`
  }
}})

// Will provide { name: "John Doe" } wrapped within a proxy
someModule.registerConstructor('wrapper', class { 
  constructor(firstName, lastName) {
    this.name = `${firstName} ${lastName}`
  }
})
```

## Standalone Registrations

Calling module registration methods implicitly creates a registration within that module. However, Registrations, can exist by themselves and be created through static methods defined as `Registration::create` method. 

### Standalone Static Registration

```typescript
const firstNameRegistration = Registration.create({ 
  token: 'firstName',
  static: 'John',  
})
const firstNameRegistration = Registration.create({ 
  token: 'lastName',
  static: 'Doe',  
})
```

### Standalone Function Registration

```typescript
const personRegistration = Registration.create({ 
  token: 'name',
  function: (firstName, lastName) => {
    return `${firstName} ${lastName}`
  } 
})
```

### Standalone Factory Registration

```typescript
const personRegistration = Registration.create({ 
  token: 'name',
  factory: (firstName, lastName) => {
    return `${firstName} ${lastName}`
  } 
})
```

### Standalone Constructor Registration

```typescript
const personRegistration = Registration.create({ 
  token: 'name',
  mode: 'bundle',
  constructor: class {
    constructor(bundle) {
      this.name = bundle.name
      this.firstName = bundle.firstName
      this.lastName = bundle.lastName
    }
  }
})
```