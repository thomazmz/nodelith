import { ControllerInputMetadata } from './controller-input-metadata';

describe('ControllerInputMetadata', () => {

  it('should return empty metadata for no parameter', () => {
    const descriptor = { value: function() {} };
    const extracted = ControllerInputMetadata.extract(descriptor);
    expect(extracted).toEqual({});
  });

  it('should extract input metadata for a single parameter', () => {
    const descriptor = { value: function(a: any) {} };
    const extracted = ControllerInputMetadata.extract(descriptor);
    expect(extracted).toEqual({ 0: 'a' });
  });

  it('should extract input metadata for a multiple parameters', () => {
    const descriptor = { value: function(a: any, b: any) {} };
    const extracted = ControllerInputMetadata.extract(descriptor);
    expect(extracted).toEqual({ 0: 'a', 1: 'b' });
  })
});
