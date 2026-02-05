import { ObjectId, Collection, MongoClient, Db } from 'mongodb'
import { CoreEntity, CoreRepository } from '@nodelith/core'

export type MongodbEntries<E extends CoreEntity> = Omit<E, keyof CoreEntity.Base>

export type MongodbDocument<E extends CoreEntity> = MongodbEntries<E> & {
  readonly _id: ObjectId,
  readonly createdAt: Date,
  readonly updatedAt: Date,
}

export abstract class MongodbRepository<E extends CoreEntity> implements CoreRepository<E> {
  protected readonly collection: Collection
  protected readonly database: Db

  public constructor(collectionName: string, databaseName: string, mongodbClient: MongoClient) {
    this.collection = mongodbClient.db(databaseName).collection(collectionName)
    this.database = mongodbClient.db(databaseName)
}

  private static toStringId(id: ObjectId): string {
    return id.toHexString()
  }

  private static toObjectId(id: string): ObjectId {
    return new ObjectId(id)
  }

  private static byQuery(entries: Partial<CoreEntity.Entries>) {
    return entries
  }

  private static byId(id: string) {
    return { _id: this.toObjectId(id) }
  }

  private static returnDocument() {
    return { returnDocument: 'after' as const }
  }

  private static setEntries(entries: Partial<CoreEntity.Entries>) {
    const { _id, createdAt, updatedAt, ...safeEntries } = entries
    return { $set: { ...safeEntries, updatedAt: new Date() } }
  }

  private static addEntries(entries: Partial<CoreEntity.Entries>, date = new Date()) {
    const { _id, createdAt, updatedAt, ...safeEntries } = entries
    return { ...safeEntries, updatedAt: date, createdAt: date }
  }

  private static getOneById<E extends CoreEntity>(collection: Collection) {
    return async (id: string, map: (document: MongodbDocument<E>) => E): Promise<E> => {
      const document = await collection.findOne({ _id: MongodbRepository.toObjectId(id) })
      if(!document) throw new Error(`Could not get document in ${collection.namespace}.`)
      return map(document as any) 
    }
  }

  private static insertOne<E extends CoreEntity>(collection: Collection) {
    return async (entries: MongodbEntries<E>): Promise<string> => {
      const result = await collection.insertOne(this.addEntries(entries))
      return MongodbRepository.toStringId(result.insertedId)
    }
  }

  private static updateOneById<E extends CoreEntity>(collection: Collection) {
    return async (id: string, entries: Partial<MongodbEntries<E>>, map: (document: MongodbDocument<E>) => E): Promise<E | undefined> => {
      const document = await collection.findOneAndUpdate(
        MongodbRepository.byId(id), 
        MongodbRepository.setEntries(entries),
        MongodbRepository.returnDocument()
      )

      return document
        ? map(document as any)
        : undefined
    }
  }

  private static updateOneByQuery<E extends CoreEntity>(collection: Collection) {
    return async (query: Partial<E>, entries: Partial<CoreEntity.Entries<E>>, map: (document: MongodbDocument<E>) => E): Promise<E | undefined> => {
      const document = await collection.findOneAndUpdate(
        MongodbRepository.byQuery(query),
        MongodbRepository.setEntries(entries),
        MongodbRepository.returnDocument()
      )

      return document
        ? map(document as any)
        : undefined
    }
  }

  private static deleteOneById(collection: Collection) {
    return async (id: string ): Promise<void> => {
      await collection.deleteOne(MongodbRepository.byId(id))
    }
  }

  private static findOneById<E extends CoreEntity>(collection: Collection) {
    return async (id: string, map: (document: MongodbDocument<E>) => E): Promise<E | undefined> => {
      const document = await collection.findOne(MongodbRepository.byId(id))
      return document ? map(document as any) : undefined
    }
  }

  private static findAll<E extends CoreEntity>(collection: Collection) {
    return async (map: (document: MongodbDocument<E>) => E): Promise<E[]> => {
      const documents = await collection.find().toArray()
      return documents.map(document => map(document as any))
    }
  }

  private static findOneByQuery<E extends CoreEntity>(collection: Collection) {
    return async (query: Partial<E>, map: (document: MongodbDocument<E>) => E): Promise<E | undefined> => {
      const document = await collection.findOne(MongodbRepository.byQuery(query))
      return document ? map(document as any) : undefined
    }
  }

  private static findByQuery<E extends CoreEntity>(collection: Collection) {
    return async (entries: Partial<E>, map: (document: MongodbDocument<E>) => E): Promise<E[]> => {
      const documents = await collection.find(MongodbRepository.byQuery(entries)).toArray()
      return documents.map(document => map(document as any))
    }
  }

  protected abstract map(document: MongodbDocument<E>): E

  public async updateOneById(id: E['id'], entries: Partial<CoreEntity.Entries<E>>): Promise<E | undefined> {
    return  MongodbRepository.updateOneById<E>(this.collection)(id, entries, this.map)
  }

  public async updateOneByQuery(query: Partial<E>, entries: Partial<CoreEntity.Entries<E>>): Promise<E | undefined> {
    return  MongodbRepository.updateOneByQuery<E>(this.collection)(query, entries, this.map)
  }

  public async createOne(entries: CoreEntity.Entries<E>): Promise<E> {
    const id = await MongodbRepository.insertOne<E>(this.collection)(entries)
    return MongodbRepository.getOneById<E>(this.collection)(id, this.map)
  }

  public async deleteOneById(id: E['id']): Promise<void> {
    await MongodbRepository.deleteOneById(this.collection)(id)
  }

  public async findByQuery(query: Partial<E>): Promise<E[]> {
    return MongodbRepository.findByQuery<E>(this.collection)(query, this.map)
  }

  public async findOneByQuery(query: Partial<E>): Promise<E | undefined> {
    return MongodbRepository.findOneByQuery<E>(this.collection)(query, this.map)
  }

  public async findOneById(id: E['id']): Promise<E | undefined> {
    return MongodbRepository.findOneById<E>(this.collection)(id, this.map)
  }

  public async findAll(): Promise<E[]> {
    return MongodbRepository.findAll<E>(this.collection)(this.map)
  }
}
