import { Entity, EntityProperties, EntityPropertiesToUpdate } from '../entity'

export interface Repository<E extends Entity<any>> {
  /**
   * @description Gets all entity instance in a repository.
   * @returns {Promise<E>} Returns all the instances in the repository  as an array.
   * @throws {RepositoryError} Throws a RepositoryError in case of failure.
   */
  getAll(): Promise<E[]>

  /**
   * @description Gets a single entity instance that matches a given id.
   * @param {E['id']} id An id that matches the single instance to get.
   * @returns {Promise<E>} Returns the matched entity or undefined if no matched entity.
   * @throws {RepositoryError} Throws a RepositoryError in case of failure.
   */
  getById(id: E['id']): Promise<E | undefined>
  
  /**
   * @description Gets multiple entity instances given an array of ids.
   * @param {E['id'][]} ids An array of entity ids that matches the instances to get.
   * @returns {Promise<E[]>} Returns the matched entities.
   * @throws {RepositoryError} Throws a RepositoryError in case of failure.
   */
  getByIds(ids: E['id'][]): Promise<E[]>

  /**
   * @description Creates a single entity instance. It will assign the instance a unique id and the createdAt/updatedAt timestamps.
   * @param {EntityProperties<E>} attributes The assignable attributes that will be used to create the entity instancy.
   * @returns {Promise<E>} Returns the created instance.
   * @throws {RepositoryError} Throws a RepositoryError in case of failure.
   */
  createOne(attributes: EntityProperties<E>): Promise<E>

  /**
   * @description Creates multiple entity instances assigning them an unique id and the createdAt/updatedAt timestamps.
   * @param {EntityProperties<E>[]} attributes The attributes that will be used to create the entity instances.
   * @returns {Promise<E[]>} Returns an array of created instances.
   * @throws {RepositoryError} Throws a RepositoryError in case of failure.
   */
  createMany(attributes: EntityProperties<E>[]): Promise<E[]>

  /**
   * @description Updates a single entity instance that matches a given id and a partial entity representation.
   * @param {E['id']} id An id that matches the instance to be updated.
   * @param {EntityPropertiesPartial<E>} attributes An object with the attributes and values to be updated.
   * @returns {Promise<E>} Returns the updated entity.
   * @throws {RepositoryError} Throws a RepositoryError in case of failure.
   */
  updateById(id: E['id'], attributes: EntityPropertiesToUpdate<E>): Promise<E>

  /**
   * @description Updates multiple entity instances given an array of ids and a partial entity representation.
   * @param {E['id'][]} ids An array of ids that matches the instances to be updated.
   * @param {EntityPropertiesPartial<E>} attributes An object with the attributes and values to be updated.
   * @returns {Promise<E[]>} Returns the updated entities.
   * @throws {RepositoryError} Throws a RepositoryError in case of failure.
   */
  updateByIds(ids: E['id'][], attributes: EntityPropertiesToUpdate<E>): Promise<E[]>

  /**
   * @description Deletes a single entity instance that matches a given id.
   * @param {E['id']} id An id that matches the instance to be deleted.
   * @throws {RepositoryError} Throws a RepositoryError in case of failure.
   */
  deleteById(id: E['id']): Promise<void>

  /**
   * @description Deletes multiple entity instances that matches an array of ids.
   * @param {E['id']} ids An array of ids that matches the instances to be deleted.
   * @throws {RepositoryError} Throws a RepositoryError in case of failure.
   */
  deleteByIds(ids: E['id'][]): Promise<void>

  /**
   * @description Counts the absolute number of instances on the repository.
   * @returns {Promise<number>} An integer representing the number of counted entities.
   * @throws {RepositoryError} Throws a RepositoryError in case of failure.
   */
  countAll(): Promise<number>
}
