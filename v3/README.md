# TODO

## Errors
[ ] Global Error Handling  
[x] Define basic HTTP error classes  
[ ] Define advanced HTTP error classes  
[ ] Handle HTTP errors return bodies during global error handling  
[ ] Return traceable error bodies to the client (request id)  

## Logging
[ ] Global logging  
[ ] Operation logging (traceable)  

## Dependency Injection  
[x] Dependency Injection Containers  
[x] Dependency Injection Modules  
[x] Dependency Injection module composition  
[x] Dependency Injection asynchornous initialization  
[x] Dependency Injection for raw values  
[x] Dependency Injection for class instances  
[x] Dependency Injection for factory results  
[x] Dependency Injection for function results  
[x] Dependency Injection for scoped registrations  
[x] Dependency Injection for singleton registrations  
[x] Dependency Injection for transient registrations  
[x] Dependency Injection provisioning mode (bundle/parameters)  
[x] Dependency Injection visibility mode (public/private)  
[ ] Dependency Injection resolution mode (eager/proxy)  

## Configuration Loading  
[x] Support for synchronous configuration loading  
[x] Support for asynchronous configuration loading  
[x] Simple configuration object declaration  
[x] Recursive configuration object declaration  
[ ] Parsing configuration string into expected primitives (string/boolean/number)  
[x] Using default .env file during applicaton startup  
[ ] Logs for configuration loading  

## Application Architecture
[x] Implement layered architecture (application/domain/infrastructure)  
[x] Figure out a way to guarantee independency on the domain layer  
[x] Structure a way for shared code to be shared without import overhead  
[x] Orchestrate common commands (build/test/start/etc...)  

## Domain Modeling  
[x] Define baseline domain types for domain Entities  
[x] Define baseline domain types for domain Values  

## Database
[x] Database pool initialization (done using mysql2)  
[ ] Database connection initialization (only needed for processes running on a single connection)  
[x] Database configuration loading  
[x] Database typesafe table declaration (done using Drizzle)  
[x] Database typesafety when writting queries (done using Drizzle)  
[ ] Database typesafe relationships declaration (achievable with drizzle)  
[ ] Database data migration runner (achievable using uzmug)  
[x] Database configuration loading   

## Repository  
[x] Repository Implementation for CRUD operations  
[ ] Repository Implementation for equality queries  
[ ] Repository implementatio for cursor pagination  
[ ] Repository Implementatio for regular pagination  

## API Controller Input Validation  
[x] Body validation/parsing  
[x] Query validation/parsing  
[x] Header validation/parsing  
[x] Prevent controllers from accessing body property when a body annotation is not provided  
[x] Prevent controllers from accessing query property when a query annotation is not provided  
[x] Prevent controllers from accessing header property when a header annotation is not provided  
[ ] Improve error message when failing to parse body (already good, but could be even better)  
[ ] Improve error message when failing to parse query (already good, but could be even better)  
[ ] Improve error message when failing to parse headers (already good, but could be even better)  

## Api Controller Output Composition
[x] Base classes for DTO shape standardization  

## API Management
[ ] Expose API health check endpoint  
[ ] Expose full API version number  
[ ] Expose swagger documentation  

## API Controller Routing  
[x] Express dynamic route composition through controller classes and module registration  
[x] Express dynamic route resolution for scoped dependency injection  
[x] Single source of truth for schema declaration input type definition  
[x] Allow dependency injection across  route handlers  

## API Controller Documentation
[x] Infer schemas from controller declarations  
[ ] Dynamic Swagger documentation generation  

## TypeScript
[ ] Review and add missing compiler options
[ ] Consider extracting configurations into a baseline tsconfig

## Testing 
[x] Unit testing with Jest  
[ ] Unit test mocking  
[ ] Integration (controller level) tests through Supertest  
[ ] E2E (application level) tests through HTTP  
[ ] Add easy ways to run individual tests through VS Code  
[ ] Add easy ways to run individual test files through VS Code  

## Tooling
[ ] Hot realoding  
