# Identity

Stable, non-enumerable object identities for JavaScript/TypeScript objects

This library generates **22-character Base62 IDs** (derived from a cryptographically-random UUID v4) and **attaches them to objects** via a **non-enumerable, non-writable, non-configurable Symbol property**. This provides a safe way to give runtime objects a persistent identity without polluting serialization or normal iteration.

---

## Features

- **Cryptographically strong IDs** via `crypto.randomUUID()`
- **Fixed-length 22-char Base62** string format: `^[0-9A-Za-z]{22}$`
- **Hidden identity field** stored under a `Symbol('__identity')`

---

## Installation

```bash
npm i <your-package-name>
# or
pnpm add <your-package-name>
# or
yarn add <your-package-name>
```

---

## Quick Start

```typescript
import { Identity } from '@nodelith/identity'

// Given an object
const object = { name: 'Alice' }

// Identities are set to objects
Identity.assign(object)

// They can be extracted safelly
console.log(Identity.extract(object))
// outputs "01dZp0m4xQwTgZsYc8N2aB"

// They do not propagate on field enumeration
console.log(Object.keys(object))
// outputs ["name"]

// Not either when converting objects as strings
console.log(JSON.stringify(object))
// {"name":"Alice"}
```

## API

### `Identity.extract(target: object): Identity | undefined`

Returns the target identity if present; otherwise returns undefined.

### `Identity.assign(target: object): Identity`

Creates a new identity and sets it on the target and returns it. Throws if target already has an identity.

### `Identity.obtain(target: object): Identity`

Returns the existing identity if present; otherwise creates and assigns one.

### `Identity.create(): Identity`  

Creates a new isolated 22-character Base 62 identity string.  

### `Identity.set(target: object, identity: Identity): Identity`

Sets the target identity given an identity string

### `Identity.bind(source: object, target: T): T`

Ensures source has an identity (creating one if needed), then sets the same identity on target.