import {
  ObjectId as MongodbObjectId
} from 'mongodb'

import { EntityProperties } from '@thomazmz/core-context'
import { MongoTestContext } from './mongo-repository-test-context'
import { MongoTestEntity } from './mongo-repository-test-entity'
import { MongoRepository } from '../src/mongo-repository'


describe('MongoRepository', () => {
  const mongoTestContext = new MongoTestContext()
  
  const mongoRepository = new MongoRepository<MongoTestEntity>(mongoTestContext.collection)

  beforeAll(async () => {
    await mongoTestContext.openConnection()
  })

  afterEach(async () => {
    await mongoTestContext.resetTestCollection()
  })

  afterAll(async () => {
    await mongoTestContext.closeConnection()
  })

  async function seedTestCollection(properties: EntityProperties<MongoTestEntity>[] = []) {
    const currentDate = new Date()
    await mongoTestContext.seedTestCollectionDocuments([ ...properties,
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

  describe('getAll', () => {
    it('should return all entities', async () => {
      await seedTestCollection()

      const entities = await mongoRepository.getAll()
      
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
    it('should return entities by id', async () => {
      await seedTestCollection()

      const entities = await mongoRepository.getAll()

      entities.forEach(async (entity) => {
        const foundEntity = await mongoRepository.getById(entity.id)
        expect(foundEntity).toEqual(entity)
      })
    })

    it('should return undefined when the given id is invalid', async () => {
      await seedTestCollection()

      const entities = await mongoRepository.getAll()

      entities.forEach(async (entity) => {
        const foundEntity = await mongoRepository.getById(`${entity.id}-invalid-id`)
        expect(foundEntity).toEqual(undefined)
      })
    })

    it('should return undefined when there is not an entity with the given id', async () => {
      await seedTestCollection()

      const invalidEntityId = new MongodbObjectId()

      const foundEntity = await mongoRepository.getById(invalidEntityId.toString())
      expect(foundEntity).toEqual(undefined)
    })
  })
})