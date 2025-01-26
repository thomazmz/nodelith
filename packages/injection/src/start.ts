// import * as Injection from './index'

import { randomUUID } from "crypto";
import { Module } from "./module";

// type Dummy = any
// type Database = any
// type DatabaseConfig = any

// const yourPreferredDatabaseLibrary: any = {
//   close: async (): Promise<any> => {
//     return Promise.resolve()
//   },
//   connect: async (): Promise<any> => {
//     return {
//       query: (sql: string): Promise<any> => {
//         return Promise.resolve()
//       }
//     }
//   }
// }

// interface DummyRepositoryInterface {
//   findById(id: string): Promise<Dummy>
// }

// class DummyService {
//   public constructor(
//     private readonly dummyRepository: DummyRepositoryInterface,
//   ) {}

//   public getDummyById(id: string) {
//     const dummy = this.dummyRepository.findById(id)

//     if(!dummy) {
//       throw new Error('Could not find Dummy!')
//     }

//     return dummy
//   }
// }

// class Logger {
//   private uuid = crypto.randomUUID()

//   public error(message: string) {
//     console.error(`[${this.uuid}]: ${message}`)
//   }

//   public info(message: string) {
//     console.info(`[${this.uuid}]: ${message}`)
//   }
// }

// class DatabaseInitializer  {
//   private readonly connectionString: string
//   private readonly connectionTimeout: number
  
//   public constructor(bundle: {
//     config: DatabaseConfig
//   }) {
//     this.connectionString = bundle.config.connectionString
//     this.connectionTimeout = bundle.config.connectionTimeout
//   }

//   public async initialize(): Promise<Database> {
//     return yourPreferredDatabaseLibrary.connect({
//       connectionString: this.connectionString,
//       connectionTimeout: this.connectionTimeout,
//     })
//   }

//   public async terminate(): Promise<void> {
//     await yourPreferredDatabaseLibrary.close()
//   }
// }

// class DummyRepositoryImplementation implements DummyRepositoryInterface {
//   private readonly database: Database

//   public constructor({ database }: { database: Database }) {
//     this.database = database
//   }

//   public findById(id: string) {
//     return this.database.query(`
//       SELECT * FROM dummies WHERE id = ${id}
//     `)
//   }
// }

// const myModule = new Injection.Module()

// myModule.register('logger', {
//   lifetime: 'transient',
//   constructor: Logger,
// })

// myModule.register('dummyService', {
//   constructor: DummyService,
//   lifetime: 'transient',
//   mode: 'spread',
// })

// myModule.registerInitializer('database', {
//   constructor: DatabaseInitializer,
// })

// myModule.register('dummyRepository', {
//   lifetime: 'singleton',
//   constructor: DummyRepositoryImplementation,
// })

// async function run() {
//   await myModule.initialize()
//   // myModule.resolve('database')  
// }

// run()

const createUuid = () => {
  return randomUUID()
}

const m1 = new Module()

m1.register('uuid', {
  lifetime: 'singleton',
  function: createUuid,
})

const m2 = new Module()

m2.useModule(m1)

console.log(m1.resolve('uuid'))
console.log(m2.resolve('uuid'))