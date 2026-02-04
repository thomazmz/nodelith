# Nodelith

Nodelith is a modular TypeScript backend toolkit with composable packages for
configuration, DI, HTTP, database access, and adapters. This repo is a pnpm
workspace that hosts the core packages and an example app.

## Packages

Core building blocks live under `packages/`:
- [`@nodelith/injection`](https://www.npmjs.com/package/@nodelith/injection) (Dependency injection)
- [`@nodelith/http`](https://www.npmjs.com/package/@nodelith/http) (HTTP utilities)
- [`@nodelith/contract`](https://www.npmjs.com/package/@nodelith/contract) (Contract utilities)
- [`@nodelith/config`](https://www.npmjs.com/package/@nodelith/config) (Configuration utilities)
- [`@nodelith/controller`](https://www.npmjs.com/package/@nodelith/controller) (Controller utilities)
- [`@nodelith/core`](https://www.npmjs.com/package/@nodelith/core) (Core Nodelith types)
- [`@nodelith/identity`](https://www.npmjs.com/package/@nodelith/identity) (Base62 identity utilities)
- [`@nodelith/express`](https://www.npmjs.com/package/@nodelith/express) (Adapters for [Express](https://expressjs.com/))
- [`@nodelith/drizzle`](https://www.npmjs.com/package/@nodelith/drizzle) (Adapters for [Drizzle ORM](https://orm.drizzle.team/))
- [`@nodelith/postgres`](https://www.npmjs.com/package/@nodelith/postgres) (Adapters for [PostgreSQL](https://www.postgresql.org/))
- [`@nodelith/mysql`](https://www.npmjs.com/package/@nodelith/mysql) (Adapters for [MySQL](https://www.mysql.com/))


The `example/` workspace shows how the packages are used together.

## Development

Install dependencies:
```
pnpm install
```

Build packages:
```
pnpm build
```

Run tests:
```
pnpm test
```

