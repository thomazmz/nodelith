# Metadata

Symbol-keyed runtime metadata for JavaScript/TypeScript objects

This library facilitates merging metadata to objects by providing a small API to **append**, **extract**, and **clear** metadata values.

---

## Features

- **Symbol-keyed storage** to avoid collisions with normal properties
- **Deep-merge append** so multiple calls can contribute partial metadata setup
- **Works on any `object`** (constructors, prototypes, functions, instances)

---

## 📦 Installation

```bash
npm i @nodelith/metadata
# or
pnpm add @nodelith/metadata
# or
yarn add @nodelith/metadata
```

---

## Usage

```typescript
import { MetadataProperties, MetadataKey, MetadataStore } from '@nodelith/metadata'

type ExampleMetadata = {
  name?: string
  options?: {
    enabled?: boolean
    tags?: string[]
  }
}

class ExampleClass {}

const KEY = MetadataKey.create<ExampleMetadata>('example-metadata')

// Use MetadataProperties to append values directly on one specific key
MetadataProperties.append<ExampleMetadata>(ExampleClass, KEY, { name: 'example' })
MetadataProperties.append<ExampleMetadata>(ExampleClass, KEY, { options: { enabled: true } })
console.log(MetadataProperties.extract<ExampleMetadata>(ExampleClass, KEY))
// -> { name: 'example', options: { enabled: true } }

// Alternatively, use MetadataStore as an enclosed key specific reference:
const MetadataStoreExample = MetadataStore.create<ExampleMetadata>('example-metadata')
MetadataStoreExample.append(ExampleClass, { name: 'example' })
MetadataStoreExample.append(ExampleClass, { options: { enabled: true } })
console.log(MetadataStoreExample.extract(ExampleClass))
// -> { name: 'example', options: { enabled: true } }
```

---

## API

For documentation, we’ll refer to the accepted “deep patch” shape as:

```typescript
type Patch<T> =
  T extends (...args: any[]) => any ? T
    : T extends readonly (infer U)[] ? readonly Patch<U>[]
      : T extends (infer U)[] ? Patch<U>[]
        : T extends object ? { [K in keyof T]?: Patch<T[K]> }
          : T
```

### `MetadataProperties.extract<T>(target: object, key: symbol): Patch<T>`

Returns the metadata stored under `key` on `target`. If none exists, returns an empty object-like value.

### `MetadataProperties.append<T>(target: object, key: symbol, patch: Patch<T>): Patch<T>`

Deep-merges `patch` into the metadata currently stored at `target[key]`.

- Missing/`undefined` fields in `patch` do not overwrite existing values
- Nested objects are merged recursively

Note: this `Patch<T>` type is shown for documentation only; it is intentionally not part of this library’s public API.

### `MetadataProperties.clear(target: object, key: symbol): void`

Removes any metadata stored under `key` on `target`.


