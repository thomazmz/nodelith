import { EntityProperties } from './entity-properties'
import { Entity} from './entity'

export type EntityPropertiesPartial<E extends Entity<any>> = Partial<EntityProperties<E>>
