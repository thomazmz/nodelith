import {
  Collection as MongodbCollection,
  ObjectId as MongodbObjectId,
} from 'mongodb'

import { 
  MongoRepository
} from './mongo-repository'

import {
  RepositoryError
} from '@thomazmz/core-context'


describe('MongoRepository unit tests', () => {
  const mongodbCollectionMock: MongodbCollection = {} as MongodbCollection

  describe('getAll method', () => {
    it('should throw ReopsitoryError when an error is thrown by the mongodb collection', async () => {
      const mongoRepository = new MongoRepository(mongodbCollectionMock)
      
      mongodbCollectionMock.find = function() {
        throw new Error('Some mocked error')
      }
  
      await expect(mongoRepository.getAll()).rejects.toThrowError(RepositoryError)
    })
  })

  describe('getById method', () => {
    it('should throw ReopsitoryError when an error is thrown by the mongodb collection', async () => {
      const mongoRepository = new MongoRepository(mongodbCollectionMock)
      
      mongodbCollectionMock.findOne = function() {
        throw new Error('Some mocked error')
      }

      const someId = (new MongodbObjectId()).toString()
  
      await expect(mongoRepository.getById(someId)).rejects.toThrowError(RepositoryError)
    })
  })

  describe('getByIds', () => {
    it('should throw ReopsitoryError when an error is thrown by the mongodb collection', async () => {
      const mongoRepository = new MongoRepository(mongodbCollectionMock)
      
      mongodbCollectionMock.find = function() {
        throw new Error('Some mocked error')
      }

      const someId = (new MongodbObjectId()).toString()
      const anotherId = (new MongodbObjectId()).toString()
  
      await expect(mongoRepository.getByIds([
        someId,
        anotherId,
      ])).rejects.toThrowError(RepositoryError)
    })
  })

  describe('deleteById', () => {
    it('should throw ReopsitoryError when an error is thrown by the mongodb collection', async () => {
      const mongoRepository = new MongoRepository(mongodbCollectionMock)
      
      mongodbCollectionMock.deleteOne = function() {
        throw new Error('Some mocked error')
      }

      const someId = (new MongodbObjectId()).toString()
  
      await expect(mongoRepository.deleteById(someId)).rejects.toThrowError(RepositoryError)
    })
  })
})