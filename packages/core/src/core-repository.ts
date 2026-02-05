import { CoreEntity } from './core-entity'

export interface CoreRepository<E extends CoreEntity = CoreEntity, Q extends Partial<E> = Partial<E>> {
  /**
   * Create a single entity instance.
   * Implementations must assign a unique id and set `createdAt` and `updatedAt` timestamps.
   *
   * @param entries Assignable entries used to create the entity instance.
   * @returns A promise that resolves to the created entity.
   * @throws {InfrastructureError} If the operation fails.
   */
  createOne(entries: CoreEntity.Entries<E>): Promise<E>

  /**
   * Update a single entity instance by id.
   * Implementations must update the `updatedAt` timestamp.
   *
   * @param id The id of the entity to update.
   * @param entries Assignable entries used to update the entity instance.
   * @returns A promise that resolves to the updated entity.
   * @throws {InfrastructureError} If the operation fails.
   * @throws {NotFoundError} If no entity exists for the given id.
   */
  updateOneById(id: E['id'], entries: Partial<CoreEntity.Entries<E>>): Promise<E | undefined>

  /**
   * Updates the first entity instance that matches a query.
  *
   * @param entries Assignable entries used to update the entity instances.
   * @param query A partial entity-shaped object used to filter results.
   * @returns A promise that resolves to the first matching entity, or `undefined` if none exists.
   * @throws {InfrastructureError} If the operation fails.
   */
  updateOneByQuery(query: Partial<E>, entries: Partial<CoreEntity.Entries<E>>): Promise<E | undefined>


  /**
   * Delete a single entity instance by id.
   *
   * @param id The id of the entity to delete.
   * @returns A promise that resolves when the entity has been deleted.
   * @throws {InfrastructureError} If the operation fails.
   * @throws {NotFoundError} If no entity exists for the given id.
   */
  deleteOneById(id: E['id']): Promise<void>

  /**
   * Find all entity instances that match a query.
   *
   * @param query A partial entity-shaped object used to filter results.
   * @returns A promise that resolves to all matching entities.
   * @throws {InfrastructureError} If the operation fails.
   */
  findByQuery(query: Q): Promise<E[]>

  /**
   * Find the first entity instance that matches a query.
   *
   * @param query A partial entity-shaped object used to filter results.
   * @returns A promise that resolves to the first matching entity, or `undefined` if none exists.
   * @throws {InfrastructureError} If the operation fails.
   */
  findOneByQuery(query: Q): Promise<E | undefined>

  /**
   * Find a single entity instance by id.
   *
   * @param id The id of the entity to find.
   * @returns A promise that resolves to the matched entity, or `undefined` if none exists.
   * @throws {InfrastructureError} If the operation fails.
   */
  findOneById(id: E['id']): Promise<E | undefined>

  /**
   * Find all entity instances in the repository.
   *
   * @returns A promise that resolves to all entity instances.
   * @throws {InfrastructureError} If the operation fails.
   */
  findAll(): Promise<E[]>
}
