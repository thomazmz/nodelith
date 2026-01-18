# @nodelith/injection

A flexible and lightweight dependency injection library for JavaScript and TypeScript. Resolve complex dependency graphs using classes, factories, functions, or static values. Manage dependency visibility and lifecycles with ease. Build composable, reusable modules for clean and maintainable architectures.

---

## Features

- **Containers** for creating dependency graphs;
- **Modules** for composing dependency graphs;
- **Lifecycle controls** manage registration lifecycle through `singleton`, `scoped`, and `transient` registrations.
- **Visibility controls** to expose only what you want through `public` and `private` visibility modes.
- **Lazy bundles** and tracing to help avoid cycles and resolve only when accessed.
- **Initialization pipeline** to run setup steps before registrations are made available.
- **Parameter inference** via AST parsing and manually overrides when desired.

---

## 📦 Installation

```bash
npm install @nodelith/injection
```
