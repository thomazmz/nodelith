import * as Mongodb  from 'mongodb'
import * as Core from '@nodelith/core'
import * as Utilities from '@nodelith/utilities'

export class MongodbRepository<E extends Core.Entity<any>> implements Core.Repository<E> {
  protected readonly collection: Mongodb.Collection

  constructor(db: Mongodb.Db, collectionName: string) {
    this.collection = db.collection(collectionName)
  }

  protected async executeRepositoryOperation<ReturnType>(asyncCallback: () => Promise<ReturnType>): Promise<ReturnType> {
    return asyncCallback().catch(error => {
      if(error instanceof Core.RepositoryError) {
        throw error
      }
      throw new Core.RepositoryError()
    })
  }

  protected convertDocumentsToEntities(documents: Mongodb.WithId<Mongodb.Document>[]): E[] {
    return documents.map(document => this.convertDocumentToEntity(document))
  }

  protected convertDocumentToEntity(document: Mongodb.WithId<Mongodb.Document>): E {
    const { _id, ...object } = document
    return { ...object, id: _id.toString() } as E
  }

  protected convertIdentifiersToDocumentFilter(ids: E['id'][]): Mongodb.Filter<Mongodb.Document> {
    return { _id: { $in: this.convertToObjectIds(ids) }}
  }

  protected convertIdentifierToDocumentFilter(id: E['id']): Mongodb.Filter<Mongodb.Document> {
    return { _id: this.convertToObjectId(id) }
  }

  protected convertToObjectId(identifier: Core.Identifier): Mongodb.ObjectId {
    return new Mongodb.ObjectId(identifier)
  }

  protected convertToObjectIds(identifiers: Core.Identifier[]): Mongodb.ObjectId[] {
    return identifiers.map(this.convertToObjectId)
  }

  protected filterValidIdentifiers(candidates: Core.Identifier[]) : Core.Identifier[] {
    return candidates.filter(this.validIdentifier)
  }

  protected resolvePropertiesToUpdate(properties: Core.EntityPropertiesToUpdate<E>) {
    const currentDate = new Date()
    return {
      $unset: { ...this.resolvePropertiesToUnset(properties) },
      $set: { ...this.resolvePropertiesToSet(properties), updatedAt: currentDate },
    }
  }

  protected resolvePropertiesToSet(properties: Core.EntityPropertiesToUpdate<E>) {
    return Object.entries(properties).reduce((acc, [key, value]) => {
      if(value === undefined || value === null) {
        return acc
      }

      return { ...acc, [key]: value }
    }, {})
  }

  protected resolvePropertiesToUnset(properties: Core.EntityPropertiesToUpdate<E>) {
    return Object.entries(properties).reduce((acc, [key, value]) => {
      if(value !== undefined && value !== null) {
        return acc
      }

      return { ...acc, [key]: '' }
    }, {})
  }

  protected validIdentifier(identifier: Core.Identifier) {
    return Mongodb.ObjectId.isValid(identifier)
  }

  public async createOne(properties: Core.EntityProperties<E>): Promise<E> {
    return this.executeRepositoryOperation(async () => {
      const currentDate = new Date()
  
      const timestamps = {
        createdAt: currentDate,
        updatedAt: currentDate,
      } as const
  
      const { insertedId } = await this.collection.insertOne({
        ...timestamps,
        ...properties,
      })
  
      return this.convertDocumentToEntity({ ...properties, ...timestamps, _id: insertedId })
    })
  }

  public async createMany(properties: Core.EntityProperties<E>[]): Promise<E[]> {
    return this.executeRepositoryOperation(async () => {

      if(properties.length === 0) {
        return []
      }

      const currentDate = new Date()
  
      const timestamps = {
        createdAt: currentDate,
        updatedAt: currentDate,
      } as const

      const timestampedProperties = properties.map((entityProperties) => ({
        ...entityProperties, ...timestamps
      }))
  
      const mongodInsertOptions = {
        ordered: true
      } as const
  
      const insertResponse = await this.collection.insertMany(
        timestampedProperties,
        mongodInsertOptions,
      )
  
      const insertedIds = Object.values(insertResponse.insertedIds)
  
      return Utilities.ArrayUtils.merge(timestampedProperties, insertedIds, (documentWithoutId, objectId) => {
        if(!documentWithoutId || !objectId) {
          // TODO: improve error throwing
          throw new Core.RepositoryError()
        }
  
        return this.convertDocumentToEntity({
          ...documentWithoutId, _id: objectId
        })
      })
    })
  }

  public async updateById(id: E['id'], properties: Core.EntityPropertiesToUpdate<E>): Promise<E> {
    return this.executeRepositoryOperation(async () => {
      const mongoDocumentFilter = this.convertIdentifierToDocumentFilter(id)

      const propertiesToUpdate = this.resolvePropertiesToUpdate(properties)

      const mongodbUpdateOptions = {
        returnDocument: 'after'
      } as const

      const document = await this.collection.findOneAndUpdate(
        mongoDocumentFilter,
        propertiesToUpdate,
        mongodbUpdateOptions,
      )

      if(!document) {
        // TODO: improve error throwing
        throw new Core.RepositoryError(`Could not update entity. Could not find a entity with id ${id}.`)
      }

      return this.convertDocumentToEntity(document)
    })
  }

  public async updateByIds(ids: E['id'][], properties: Core.EntityPropertiesToUpdate<E>): Promise<E[]> {
    return this.executeRepositoryOperation(async () => {
      const mongoDocumentFilter = this.convertIdentifiersToDocumentFilter(ids)

      const propertiesToUpdate = this.resolvePropertiesToUpdate(properties)

      await this.collection.updateMany(mongoDocumentFilter, propertiesToUpdate)

      // TODO: Wrap collection calls into a transaction
      // TODO: Use find operation directly instead of calling getById
      return this.getByIds(ids)
    })
  }

  public async deleteById(id: E['id']): Promise<void> {
    return this.executeRepositoryOperation(async () => {
      if(!this.validIdentifier(id)) {
        return
      }
  
      const mongoFilter = this.convertIdentifierToDocumentFilter(id)
      await this.collection.deleteOne(mongoFilter)
    })
  }

  public async deleteByIds(ids: E['id'][]): Promise<void> {
    return this.executeRepositoryOperation(async () => {
      const validObjectIds = this.filterValidIdentifiers(ids)

      if(validObjectIds.length === 0) {
        return
      }

      const mongoFilter = this.convertIdentifiersToDocumentFilter(ids)
  
      await this.collection.deleteMany(mongoFilter)
    })
  }

  public async getAll(): Promise<E[]> {
    return this.executeRepositoryOperation(async () => {
      const documents = await this.collection.find().toArray()
      return this.convertDocumentsToEntities(documents)
    })
  }

  public async getById(id: E['id']): Promise<E | undefined> {
    return this.executeRepositoryOperation(async () => {
      if(!this.validIdentifier(id)) {
        return undefined
      }

      const mongoFilter = this.convertIdentifierToDocumentFilter(id)
      const document = await this.collection.findOne(mongoFilter)
  
      if(!document) {
        return undefined
      }
  
      return this.convertDocumentToEntity(document)
    })
  }

  public async getByIds(ids: E['id'][]): Promise<E[]> {
    return this.executeRepositoryOperation(async () => {
      const validIds = ids.filter(this.validIdentifier)

      if(validIds.length === 0) {
        return []
      }

      const mongoFilter = this.convertIdentifiersToDocumentFilter(ids)

      const documents = await this.collection.find(mongoFilter).toArray()

      return this.convertDocumentsToEntities(documents)
    })
  }

  countAll(): Promise<number> {
    return this.collection.countDocuments()
  }
}
