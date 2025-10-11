import { CoreEntity } from './core-entity'

export interface CoreRepository<E extends CoreEntity = CoreEntity> {

  /**
   * @description Gets all entity instance in a repository.
   * @returns {Promise<E>} Returns all the instances in the repository  as an array.
   * @throws {InfrastructureError} Throws a InfrastructureError in case of failure.
   */
  getAll(): Promise<E[]>

  /**
   * @description Gets a single entity instance that matches a given id.
   * @param {E['id']} id An id matching the single instance to get.
   * @returns {Promise<E>} Returns the matched entity or throws
   */
  getById(id: E['id']): Promise<E>

  /**
   * @description Creates a single entity instance. It will assign the instance a unique id and the createdAt/updatedAt timestamps.
   * @param {CoreEntity.Enries<E>} entries The assignable entries that will be used to create the entity instancy.
   * @returns {Promise<E>} Returns the created instance.
   */
  create(entries: CoreEntity.Entries<E>): Promise<E>

  /**
   * @description Creates a single entity instance. It will assign the instance a unique id and the createdAt/updatedAt timestamps.
   * @param {CoreEntity.Enries<E>} entries The assignable entries that will be used to create the entity instancy.
   * @returns {Promise<E>} Returns the created instance.
   */
  update(id: E['id'], entries: Partial<CoreEntity.Entries<E>>): Promise<E>

  /**
   * @description Deleets a single entity instance.
   * @param {E['id']} id An id matching the single instance to be deleted.
   * @returns {Promise<void>}
   */
  delete(id: E['id']): Promise<void>
}
