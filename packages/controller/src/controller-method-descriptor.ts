import { Function } from '@core-fusion/context';
import { ControllerMethodMetadata } from './controller-method-metadata';

export type ControllerMethodDescriptor = TypedPropertyDescriptor<
  Function & { [ControllerMethodMetadata.METADATA_KEY]?: ControllerMethodMetadata }
>;