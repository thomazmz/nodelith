import { randomUUID } from 'crypto'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { MongodbRepository } from './mongodb-repository'
import * as Mongodb from 'mongodb'
import * as Core from '@nodelith/core'

export type MongoTestEntity = {
  readonly id: string,
  readonly createdAt: Date,
  readonly updatedAt: Date,
  readonly dateProperty: Date,
  readonly numberProperty: number,
  readonly stringProperty: string,
  readonly booleanProperty: boolean,
  readonly optionalDateProperty?: Date,
  readonly optionalNumberProperty?: number,
  readonly optionalStringProperty?: string,
  readonly optionalBooleanProperty?: boolean,
}

export class MongoTestContext {
  public static readonly DATABASE_NAME = 'test-database'

  public static readonly MEMORY_SERVER: MongoMemoryServer = new MongoMemoryServer({ 
    instance: { dbName: MongoTestContext.DATABASE_NAME }
  })

  public static async startMemoryServer() {
    await MongoTestContext.MEMORY_SERVER.start()
  }

  public static async stopMemoryServer() {
    await MongoTestContext.MEMORY_SERVER.stop()
  }

  private client?: Mongodb.MongoClient

  private database?: Mongodb.Db

  private collection?: Mongodb.Collection

  public constructor(public readonly collectionName: string = randomUUID()) {}

  public async openConnection(): Promise<void> {
    await this.resolveClient().connect()
  }

  public async closeConnection(): Promise<void> {
    await this.resolveClient().close()
  }

  public async resetTestCollection(): Promise<void> {
    await this.resolveClient().db(MongoTestContext.DATABASE_NAME).collection(this.collectionName).deleteMany()
  }

  public async seedTestCollectionDocuments(entities: any[]) {
    return this.resolveCollection().insertMany(entities)
  }

  public async fetchTestCollectionDocuments(): Promise<Mongodb.Document[]> {
    return this.resolveCollection().find().toArray()
  }

  public resolveCollection() {
    if(!this.collection) {
      const database = this.resolveDatabase()
      return this.collection = database.collection(this.collectionName)
    }

    return this.collection
  }

  public resolveDatabase() {
    if(!this.database) {
      const client = this.resolveClient()
      return this.database = client.db(MongoTestContext.DATABASE_NAME)
    }

    return this.database
  }

  public resolveClient(): Mongodb.MongoClient {
    if(!this.client) {
      return this.client = new Mongodb.MongoClient(MongoTestContext.MEMORY_SERVER.getUri())
    }
    
    return this.client;
  }
}

beforeAll(async () => {
  await MongoTestContext.startMemoryServer()
})

afterAll(async () => {
  await MongoTestContext.stopMemoryServer()
})

describe('MongoRepository', () => {
  const mongodbCollectionMockName = 'someCollectionName'

  const mongodbCollectionMock = {} as Mongodb.Collection

  const mongodbMock = { collection() { return mongodbCollectionMock } } as unknown as Mongodb.Db

  const mongodbInMemory = new MongoTestContext()

  const createTestRepository = (): Core.Repository<MongoTestEntity> => {
    return new MongodbRepository<MongoTestEntity>(
      mongodbInMemory.resolveDatabase(),
      mongodbInMemory.collectionName
    )
  }

  const seedTestCollection = (properties: Core.EntityProperties<MongoTestEntity>[] = []) => {
    const currentDate = new Date()

    return mongodbInMemory.seedTestCollectionDocuments([ ...properties,
      {
        createdAt: currentDate,
        updatedAt: currentDate,
        stringProperty: 'AAA',
        numberProperty: 123,
        dateProperty: new Date(10),
        booleanProperty: true,
      },
      {
        createdAt: currentDate,
        updatedAt: currentDate,
        stringProperty: 'AAA',
        numberProperty: 234,
        dateProperty: new Date(20),
        booleanProperty: false,
      },
      {
        createdAt: currentDate,
        updatedAt: currentDate,
        stringProperty: 'BBB',
        numberProperty: 234,
        dateProperty: new Date(30),
        booleanProperty: true,
      },
      {
        createdAt: currentDate,
        updatedAt: currentDate,
        stringProperty: 'CCC',
        numberProperty: 345,
        dateProperty: new Date(30),
        booleanProperty: false,
      },
      {
        createdAt: currentDate,
        updatedAt: currentDate,
        stringProperty: 'EEE',
        numberProperty: 456,
        dateProperty: new Date(40),
        booleanProperty: true,
      },
      {
        createdAt: currentDate,
        updatedAt: currentDate,
        stringProperty: 'FFF',
        numberProperty: 567,
        dateProperty: new Date(50),
        booleanProperty: false,
      },
    ])
  }

  beforeAll(async () => {
    await mongodbInMemory.openConnection()
  })

  afterAll(async () => {
    await mongodbInMemory.closeConnection()
  })

  afterEach(async () => {
    await mongodbInMemory.resetTestCollection()
  })

  describe('getAll', () => {
    it('should throw RepositoryError when an error is thrown by the mongodb collection', async () => {
      const mongoRepository = new MongodbRepository(mongodbMock, mongodbCollectionMockName)
      
      mongodbCollectionMock.find = function() {
        throw new Error('Some mocked error')
      }
  
      await expect(mongoRepository.getAll()).rejects.toThrow(Core.RepositoryError)
    })

    it('should return all entities', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entities = await testRepository.getAll()

      expect(entities.length).toBe(6)

      expect(entities).toEqual(expect.arrayContaining([
        expect.objectContaining({
          stringProperty: 'AAA',
          numberProperty: 123,
          dateProperty: new Date(10),
          booleanProperty: true,
        }),
        expect.objectContaining({
          stringProperty: 'AAA',
          numberProperty: 234,
          dateProperty: new Date(20),
          booleanProperty: false,
        }),
        expect.objectContaining({
          stringProperty: 'BBB',
          numberProperty: 234,
          dateProperty: new Date(30),
          booleanProperty: true,
        }),
        expect.objectContaining({
          stringProperty: 'CCC',
          numberProperty: 345,
          dateProperty: new Date(30),
          booleanProperty: false,
        }),
        expect.objectContaining({
          stringProperty: 'EEE',
          numberProperty: 456,
          dateProperty: new Date(40),
          booleanProperty: true,
        }),
        expect.objectContaining({
          stringProperty: 'FFF',
          numberProperty: 567,
          dateProperty: new Date(50),
          booleanProperty: false,
        }),
      ]))
    })
  })

  describe('getById', () => {
    it('Should throw RepositoryError when an error is thrown by the mongodb collection', async () => {
      const mongoRepository = new MongodbRepository(mongodbMock, mongodbCollectionMockName)
      
      mongodbCollectionMock.findOne = function() {
        throw new Error('Some mocked error')
      }

      const someId = (new Mongodb.ObjectId()).toString()
  
      await expect(mongoRepository.getById(someId)).rejects.toThrow(Core.RepositoryError)
    })

    it('Should return undefined when an invalid id is passed', async () => {
      const mongoRepository = new MongodbRepository(mongodbMock, mongodbCollectionMockName)

      const someInvalidId = 'someInvalidId'

      const result = await mongoRepository.getById(someInvalidId)
  
      expect(result).toEqual(undefined)
    })

    it('should return entities by id', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entities = await testRepository.getAll()

      for (const entity of entities) {
        const foundEntity = await testRepository.getById(entity.id)
        expect(foundEntity).toEqual(entity)
      }
    })

    it('should return undefined when the given id is invalid', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entity = await testRepository.getById('some-invalid-entity-id')

      expect(entity).toEqual(undefined)
    })

    it('should return undefined when there is not an entity with the given id', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const invalidEntityId = new Mongodb.ObjectId()

      const entity = await testRepository.getById(invalidEntityId.toString())

      expect(entity).toBe(undefined)
    })
  })

  describe('getByIds', () => {
    it('Should throw RepositoryError when an error is thrown by the mongodb collection', async () => {
      const mongoRepository = new MongodbRepository(mongodbMock, mongodbCollectionMockName)
      
      mongodbCollectionMock.find = function() {
        throw new Error('Some mocked error')
      }

      const someId = (new Mongodb.ObjectId()).toString()
      const anotherId = (new Mongodb.ObjectId()).toString()
  
      await expect(mongoRepository.getByIds([
        someId,
        anotherId,
      ])).rejects.toThrow(Core.RepositoryError)
    })

    it('Should return empty array when no valid ids are passed', async () => {
      const mongoRepository = new MongodbRepository(mongodbMock, mongodbCollectionMockName)

      const someInvalidId = 'someInvalidId'
      const anotherInvalidId = 'anotherInvalidId'

      const result = await mongoRepository.getByIds([
        someInvalidId,
        anotherInvalidId,
      ])
  
      expect(result).toEqual([])
    })

    it('Should return empty array if all given ids are invalid', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const foundEntities = await testRepository.getByIds([
        'some-invalid-object-id',
        'another-invalid-object-id',
      ])

      expect(foundEntities).toEqual([])
    })

    it('Should return array with entities that match give ids', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entities = await testRepository.getAll()
      const firstEntityId = entities[0]?.id!
      const secondEntityId = entities[1]?.id!

      const foundEntities = await testRepository.getByIds([
        firstEntityId,
        secondEntityId,
      ])

      expect(foundEntities).toEqual(expect.arrayContaining([
        entities[0],
        entities[1],
      ]))
    })
  })

  describe('countAll', () => {
    it('Should count all entities', async () => {
      await seedTestCollection()

      const repository = createTestRepository()
      const entities = await repository.getAll()
      const count = await repository.countAll()

      expect(entities.length).toBe(count)
    })
  })

  describe('deleteById', () => {
    it('Should throw RepositoryError when an error is thrown by the mongodb collection', async () => {
      const mongoRepository = new MongodbRepository(mongodbMock, mongodbCollectionMockName)
      
      mongodbCollectionMock.deleteOne = function() {
        throw new Error('Some mocked error')
      }

      const someId = (new Mongodb.ObjectId()).toString()
  
      await expect(mongoRepository.deleteById(someId)).rejects.toThrow(Core.RepositoryError)
    })

    it('Should delete element by id', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entities = await testRepository.getAll()

      for (const entity of entities) {
        await testRepository.deleteById(entity.id)
        const remainingEntities = await testRepository.getAll()

        expect(remainingEntities.every((remainingEntity) => {
          return remainingEntity.id !==  entity.id
        })).toEqual(true)
      }
    })

    it('Should accept an invalid id without throwing an error', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entity = await testRepository.deleteById('some-invalid-entity-id')

      expect(entity).toEqual(undefined)
    })

    it('Should accept an unmatching id without throwing an error', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const invalidEntityId = new Mongodb.ObjectId()

      const entity = await testRepository.deleteById(invalidEntityId.toString())

      expect(entity).toBe(undefined)
    })
  })

  describe('deleteByIds', () => {
    it('Should throw RepositoryError when an error is thrown by the mongodb collection', async () => {
      const mongoRepository = new MongodbRepository(mongodbMock, mongodbCollectionMockName)
      
      mongodbCollectionMock.deleteMany = function() {
        throw new Error('Some mocked error')
      } 

      const someId = (new Mongodb.ObjectId()).toString()
      const anotherId = (new Mongodb.ObjectId()).toString()
  
      await expect(mongoRepository.deleteByIds([
        someId,
        anotherId,
      ])).rejects.toThrow(Core.RepositoryError)
    })

    it('Should accept an invalid ids without throwing an error', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entity = await testRepository.deleteByIds([
        'another-invalid-entity-id',
        'some-invalid-entity-id',
      ])

      expect(entity).toEqual(undefined)
    })

    it('Should delete elements by ids', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entities = await testRepository.getAll()
      const firstEntityId = entities[0]?.id!
      const secondEntityId = entities[1]?.id!

      await testRepository.deleteByIds([
        firstEntityId,
        secondEntityId,
      ])

      const remainingEntities = await testRepository.getAll()

      expect(remainingEntities.every(({ id }) => {
        return id !==  firstEntityId && id !== secondEntityId
      })).toEqual(true)
    })
  })

  describe('updateById', () => {
    it('Should throw RepositoryError when an error is thrown by the mongodb collection', async () => {
      const mongoRepository = new MongodbRepository(mongodbMock, mongodbCollectionMockName)
      
      mongodbCollectionMock.findOneAndUpdate = function() {
        throw new Error('Some mocked error')
      }

      const someId = (new Mongodb.ObjectId()).toString()
  
      await expect(mongoRepository.updateById(someId, {})).rejects.toThrow(Core.RepositoryError)
    })

    it('Should update entity', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entities = await testRepository.getAll()
      const someEntityId = entities[0]?.id!

      await testRepository.updateById(someEntityId, {
        stringProperty: 'ABC',
        numberProperty: 321,
        dateProperty: new Date(1000),
        booleanProperty: false,
      })

      const updatedEntity = await testRepository.getById(someEntityId)

      expect(updatedEntity?.id).toEqual(someEntityId,)
      expect(updatedEntity?.stringProperty).toEqual('ABC')
      expect(updatedEntity?.numberProperty).toEqual(321)
      expect(updatedEntity?.dateProperty).toEqual(new Date(1000))
      expect(updatedEntity?.booleanProperty).toEqual(false)
    })

    it('Should return updated entity', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entities = await testRepository.getAll()
      const someEntityId = entities[0]?.id!

      const updatedEntity = await testRepository.updateById(someEntityId, {
        stringProperty: 'ABC',
        numberProperty: 321,
        dateProperty: new Date(1000),
        booleanProperty: false,
      })

      expect(updatedEntity.id).toEqual(someEntityId,)
      expect(updatedEntity.stringProperty).toEqual('ABC')
      expect(updatedEntity.numberProperty).toEqual(321)
      expect(updatedEntity.dateProperty).toEqual(new Date(1000))
      expect(updatedEntity.booleanProperty).toEqual(false)
    })

    it('Should partially update entity', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entities = await testRepository.getAll()
      const someEntity = entities[0]
      const someEntityId = someEntity?.id!

      const updatedEntity = await testRepository.updateById(someEntityId, {
        stringProperty: 'ABC',
        numberProperty: 321,
      })

      expect(updatedEntity.id).toEqual(someEntityId,)
      expect(updatedEntity.stringProperty).toEqual('ABC')
      expect(updatedEntity.numberProperty).toEqual(321)
      expect(updatedEntity.dateProperty).toEqual(someEntity?.dateProperty)
      expect(updatedEntity.booleanProperty).toEqual(someEntity?.booleanProperty)
    })

    it('Should unset entity properties', async () => {
      await mongodbInMemory.seedTestCollectionDocuments([{
        stringProperty: 'AAA',
        numberProperty: 123,
        dateProperty: new Date(10),
        booleanProperty: true,
        optionalStringProperty: 'BBB',
        optionalNumberProperty: 456,
        optionalDateProperty: new Date(20),
        optionalBooleanProperty: false,
      }])

      const testRepository = createTestRepository()

      const entityCount = await testRepository.countAll()
      
      expect(entityCount).toBe(1)

      const [ someEntity ] = await testRepository.getAll()
      
      expect(someEntity?.stringProperty).toEqual('AAA')
      expect(someEntity?.numberProperty).toEqual(123)
      expect(someEntity?.dateProperty).toEqual(new Date(10))
      expect(someEntity?.booleanProperty).toEqual(true)
      expect(someEntity?.optionalStringProperty).toEqual('BBB')
      expect(someEntity?.optionalNumberProperty).toEqual(456)
      expect(someEntity?.optionalDateProperty).toEqual(new Date(20))
      expect(someEntity?.optionalBooleanProperty).toEqual(false)

      const updateEntityResult = await testRepository.updateById(someEntity?.id!, {
        optionalStringProperty: undefined,
        optionalNumberProperty: undefined,
        optionalDateProperty: undefined,
        optionalBooleanProperty: undefined,
      })

      expect(updateEntityResult.id).toEqual(someEntity?.id)
      expect(updateEntityResult.stringProperty).toEqual(someEntity?.stringProperty)
      expect(updateEntityResult.numberProperty).toEqual(someEntity?.numberProperty)
      expect(updateEntityResult.dateProperty).toEqual(someEntity?.dateProperty)
      expect(updateEntityResult.booleanProperty).toEqual(someEntity?.booleanProperty)
      expect("optionalStringProperty" in updateEntityResult).toBe(false)
      expect("optionalNumberProperty" in updateEntityResult).toBe(false)
      expect("optionalDateProperty" in updateEntityResult).toBe(false)
      expect("optionalBooleanProperty" in updateEntityResult).toBe(false)

      const updatedEntity = await testRepository.getById(someEntity?.id!)

      expect(updatedEntity).toBeDefined()
      expect(updatedEntity?.id).toEqual(someEntity?.id)
      expect(updatedEntity?.stringProperty).toEqual(someEntity?.stringProperty)
      expect(updatedEntity?.numberProperty).toEqual(someEntity?.numberProperty)
      expect(updatedEntity?.dateProperty).toEqual(someEntity?.dateProperty)
      expect(updatedEntity?.booleanProperty).toEqual(someEntity?.booleanProperty)
      expect(updatedEntity && "optionalStringProperty" in updatedEntity).toBe(false)
      expect(updatedEntity && "optionalNumberProperty" in updatedEntity).toBe(false)
      expect(updatedEntity && "optionalDateProperty" in updatedEntity).toBe(false)
      expect(updatedEntity && "optionalBooleanProperty" in updatedEntity).toBe(false)
    })
  })

  describe('updateByIds', () => {
    it('Should throw RepositoryError when an error is thrown by the mongodb collection', async () => {
      const mongoRepository = new MongodbRepository(mongodbMock, mongodbCollectionMockName)
      
      mongodbCollectionMock.updateMany = function() {
        throw new Error('Some mocked error')
      }

      const someId = (new Mongodb.ObjectId()).toString()
  
      await expect(mongoRepository.updateById(someId, {})).rejects.toThrow(Core.RepositoryError)
    })

    it('Should update entities', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entities = await testRepository.getAll()
      const someEntityId = entities[0]?.id!
      const anotherEntityId = entities[1]?.id!

      await testRepository.updateByIds([
        someEntityId,
        anotherEntityId,
      ], {
        stringProperty: 'ABC',
        numberProperty: 321,
        dateProperty: new Date(1000),
        booleanProperty: false,
      })

      const updatedEntities = await testRepository.getByIds([
        someEntityId,
        anotherEntityId,
      ])

      const someUpdatedEntity = updatedEntities.find(e => e.id === someEntityId)

      expect(someUpdatedEntity?.id).toEqual(someEntityId)
      expect(someUpdatedEntity?.stringProperty).toEqual('ABC')
      expect(someUpdatedEntity?.numberProperty).toEqual(321)
      expect(someUpdatedEntity?.dateProperty).toEqual(new Date(1000))
      expect(someUpdatedEntity?.booleanProperty).toEqual(false)

      const anotherUpdatedEntity = updatedEntities.find(e => e.id === anotherEntityId)

      expect(anotherUpdatedEntity?.id).toEqual(anotherEntityId)
      expect(anotherUpdatedEntity?.stringProperty).toEqual('ABC')
      expect(anotherUpdatedEntity?.numberProperty).toEqual(321)
      expect(anotherUpdatedEntity?.dateProperty).toEqual(new Date(1000))
      expect(anotherUpdatedEntity?.booleanProperty).toEqual(false)
    })

    it('Should return updated entities', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entities = await testRepository.getAll()
      const someEntityId = entities[0]?.id!
      const anotherEntityId = entities[1]?.id!

      const updatedEntities = await testRepository.updateByIds([
        someEntityId,
        anotherEntityId,
      ], {
        stringProperty: 'ABC',
        numberProperty: 321,
        dateProperty: new Date(1000),
        booleanProperty: false,
      })

      expect(updatedEntities[0]?.id).toEqual(someEntityId,)
      expect(updatedEntities[0]?.stringProperty).toEqual('ABC')
      expect(updatedEntities[0]?.numberProperty).toEqual(321)
      expect(updatedEntities[0]?.dateProperty).toEqual(new Date(1000))
      expect(updatedEntities[0]?.booleanProperty).toEqual(false)

      expect(updatedEntities[1]?.id).toEqual(anotherEntityId)
      expect(updatedEntities[1]?.stringProperty).toEqual('ABC')
      expect(updatedEntities[1]?.numberProperty).toEqual(321)
      expect(updatedEntities[1]?.dateProperty).toEqual(new Date(1000))
      expect(updatedEntities[1]?.booleanProperty).toEqual(false)
    })

    it('Should partially update entities', async () => {
      await seedTestCollection()

      const testRepository = createTestRepository()

      const entities = await testRepository.getAll()
      
      const someEntityId = entities[0]?.id!
      const anotherEntityId = entities[1]?.id!

      await testRepository.updateByIds([
        someEntityId,
        anotherEntityId,
      ], {
        stringProperty: 'ABC',
        numberProperty: 321,
      })

      const someUpdatedEntity = await testRepository.getById(someEntityId)
      const anotherUpdatedEntity = await testRepository.getById(anotherEntityId)

      expect(someUpdatedEntity?.id).toEqual(someEntityId)
      expect(someUpdatedEntity?.stringProperty).toEqual('ABC')
      expect(someUpdatedEntity?.numberProperty).toEqual(321)
      expect(someUpdatedEntity?.dateProperty).toEqual(entities[0]?.dateProperty)
      expect(someUpdatedEntity?.booleanProperty).toEqual(entities[0]?.booleanProperty)

      expect(anotherUpdatedEntity?.id).toEqual(anotherEntityId)
      expect(anotherUpdatedEntity?.stringProperty).toEqual('ABC')
      expect(anotherUpdatedEntity?.numberProperty).toEqual(321)
      expect(anotherUpdatedEntity?.dateProperty).toEqual(entities[1]?.dateProperty)
      expect(anotherUpdatedEntity?.booleanProperty).toEqual(entities[1]?.booleanProperty)
    })

    it('Should unset properties from many entities', async () => {
      await mongodbInMemory.seedTestCollectionDocuments([
        {
          stringProperty: 'AAA',
          numberProperty: 12,
          dateProperty: new Date(10),
          booleanProperty: true,
          optionalStringProperty: 'BBB',
          optionalNumberProperty: 34,
          optionalDateProperty: new Date(20),
          optionalBooleanProperty: false,
        },
        {
          stringProperty: 'AAA',
          numberProperty: 12,
          dateProperty: new Date(10),
          booleanProperty: true,
          optionalStringProperty: 'BBB',
          optionalNumberProperty: 34,
          optionalDateProperty: new Date(20),
          optionalBooleanProperty: false,
        }
      ])

      const testRepository = createTestRepository()

      const entityCount = await testRepository.countAll()
      
      expect(entityCount).toBe(2)

      const [ someEntity, anotherEntity ] = await testRepository.getAll()

      expect(someEntity?.stringProperty).toEqual('AAA')
      expect(someEntity?.numberProperty).toEqual(12)
      expect(someEntity?.dateProperty).toEqual(new Date(10))
      expect(someEntity?.booleanProperty).toEqual(true)
      expect(someEntity?.optionalStringProperty).toEqual('BBB')
      expect(someEntity?.optionalNumberProperty).toEqual(34)
      expect(someEntity?.optionalDateProperty).toEqual(new Date(20))
      expect(someEntity?.optionalBooleanProperty).toEqual(false)

      expect(anotherEntity?.stringProperty).toEqual('AAA')
      expect(anotherEntity?.numberProperty).toEqual(12)
      expect(anotherEntity?.dateProperty).toEqual(new Date(10))
      expect(anotherEntity?.booleanProperty).toEqual(true)
      expect(anotherEntity?.optionalStringProperty).toEqual('BBB')
      expect(anotherEntity?.optionalNumberProperty).toEqual(34)
      expect(anotherEntity?.optionalDateProperty).toEqual(new Date(20))
      expect(anotherEntity?.optionalBooleanProperty).toEqual(false)

      const [ 
        someEntityUpdateResult, 
        anotherEntityUpdateResult
      ] = await testRepository.updateByIds([
        someEntity?.id!,
        anotherEntity?.id!,
      ], {
        optionalStringProperty: undefined,
        optionalNumberProperty: undefined,
        optionalDateProperty: undefined,
        optionalBooleanProperty: undefined,
      })

      expect(someEntityUpdateResult?.stringProperty).toEqual('AAA')
      expect(someEntityUpdateResult?.numberProperty).toEqual(12)
      expect(someEntityUpdateResult?.dateProperty).toEqual(new Date(10))
      expect(someEntityUpdateResult?.booleanProperty).toEqual(true)

      expect(someEntityUpdateResult && "optionalStringProperty" in someEntityUpdateResult).toBe(false)
      expect(someEntityUpdateResult && "optionalNumberProperty" in someEntityUpdateResult).toBe(false)
      expect(someEntityUpdateResult && "optionalDateProperty" in someEntityUpdateResult).toBe(false)
      expect(someEntityUpdateResult && "optionalBooleanProperty" in someEntityUpdateResult).toBe(false)

      expect(anotherEntityUpdateResult?.stringProperty).toEqual('AAA')
      expect(anotherEntityUpdateResult?.numberProperty).toEqual(12)
      expect(anotherEntityUpdateResult?.dateProperty).toEqual(new Date(10))
      expect(anotherEntityUpdateResult?.booleanProperty).toEqual(true)

      expect(anotherEntityUpdateResult && "optionalStringProperty" in anotherEntityUpdateResult).toBe(false)
      expect(anotherEntityUpdateResult && "optionalNumberProperty" in anotherEntityUpdateResult).toBe(false)
      expect(anotherEntityUpdateResult && "optionalDateProperty" in anotherEntityUpdateResult).toBe(false)
      expect(anotherEntityUpdateResult && "optionalBooleanProperty" in anotherEntityUpdateResult).toBe(false)


      const [
        someUpdatedEntity,
        anotherUpdatedEntity 
      ] = await testRepository.getAll()

      expect(someUpdatedEntity?.stringProperty).toEqual('AAA')
      expect(someUpdatedEntity?.numberProperty).toEqual(12)
      expect(someUpdatedEntity?.dateProperty).toEqual(new Date(10))
      expect(someUpdatedEntity?.booleanProperty).toEqual(true)

      expect(someUpdatedEntity && "optionalStringProperty" in someUpdatedEntity).toBe(false)
      expect(someUpdatedEntity && "optionalNumberProperty" in someUpdatedEntity).toBe(false)
      expect(someUpdatedEntity && "optionalDateProperty" in someUpdatedEntity).toBe(false)
      expect(someUpdatedEntity && "optionalBooleanProperty" in someUpdatedEntity).toBe(false)

      expect(anotherUpdatedEntity?.stringProperty).toEqual('AAA')
      expect(anotherUpdatedEntity?.numberProperty).toEqual(12)
      expect(anotherUpdatedEntity?.dateProperty).toEqual(new Date(10))
      expect(anotherUpdatedEntity?.booleanProperty).toEqual(true)

      expect(anotherUpdatedEntity && "optionalStringProperty" in anotherUpdatedEntity).toBe(false)
      expect(anotherUpdatedEntity && "optionalNumberProperty" in anotherUpdatedEntity).toBe(false)
      expect(anotherUpdatedEntity && "optionalDateProperty" in anotherUpdatedEntity).toBe(false)
      expect(anotherUpdatedEntity && "optionalBooleanProperty" in anotherUpdatedEntity).toBe(false)
    })
  })

  describe('createOne', () => {
    it('Should throw RepositoryError when an error is thrown by the mongodb collection', async () => {
      const mongoRepository = new MongodbRepository(mongodbMock, mongodbCollectionMockName)
      
      mongodbCollectionMock.insertOne = function() {
        throw new Error('Some mocked error')
      }
  
      await expect(mongoRepository.createOne({})).rejects.toThrow(Core.RepositoryError)
    })

    it('Should create one entity', async () => {
      const testRepository = createTestRepository()

      const entityProperties: Core.EntityProperties<MongoTestEntity> = {
        numberProperty:  1,
        dateProperty: new Date(),
        stringProperty:  'someString',
        booleanProperty: true,
      }

      const createdEntity = await testRepository.createOne(entityProperties)
      const foundEntity = await testRepository.getById(createdEntity.id)
      
      expect(foundEntity).toEqual(createdEntity)
    })
  })

  describe('createMany', () => {
    it('Should throw RepositoryError when an error is thrown by the mongodb collection', async () => {
      const mongoRepository = new MongodbRepository(mongodbMock, mongodbCollectionMockName)
      
      mongodbCollectionMock.insertOne = function() {
        throw new Error('Some mocked error')
      }
  
      await expect(mongoRepository.createMany([{}])).rejects.toThrow(Core.RepositoryError)
    })

    it('Should return empty array when empty array is passed', async () => {
      const mongoRepository = new MongodbRepository(mongodbMock, mongodbCollectionMockName)
      const result = await mongoRepository.createMany([])
      expect(result).toEqual([])
    })

    it('Should create many entities', async () => {
      const testRepository = createTestRepository()

      const someEntityProperties: Core.EntityProperties<MongoTestEntity> = {
        numberProperty:  1,
        dateProperty: new Date(0),
        stringProperty:  'someString',
        booleanProperty: true,
      }

      const anotherEntityProperties: Core.EntityProperties<MongoTestEntity> = {
        numberProperty:  2,
        dateProperty: new Date(1),
        stringProperty:  'anotherString',
        booleanProperty: false,
      }

      const createdEntities = await testRepository.createMany([
        someEntityProperties, 
        anotherEntityProperties,
      ])

      const foundEntities = await testRepository.getByIds(createdEntities.map(entity => entity.id))

      expect(foundEntities).toEqual(expect.arrayContaining(createdEntities))
    })
  })
})
