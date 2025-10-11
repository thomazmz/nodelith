import { ControllerRouterMetadata } from './controller-router-metadata'
import { Router } from './controller-router-metadata'
import { Name } from './controller-router-metadata'

describe('ControllerRouterMetadata', () => {
  it('should merge metadata fields', () => {
    class SomeClass {}
    ControllerRouterMetadata.attach(SomeClass, { path: '/bar' });
    ControllerRouterMetadata.attach(SomeClass, { name: 'Bar' });
    const extracted = ControllerRouterMetadata.extract(SomeClass);
    expect(extracted).toEqual({ name: 'Bar', path: '/bar' })
  });

  it('should override metadata fields', () => {
    class SomeClass {}
    ControllerRouterMetadata.attach(SomeClass, { path: '/bar', name: 'Foo' })
    ControllerRouterMetadata.attach(SomeClass, { path: '/foo' })
    const extracted = ControllerRouterMetadata.extract(SomeClass)
    expect(extracted).toEqual({ name: 'Foo', path: '/foo' })
  })

  it('should return empty metadata', () => {
    class Constructore {}
    const extracted = ControllerRouterMetadata.extract(Constructore)
    expect(extracted).toEqual({ name: undefined, path: undefined })
  })

  it('should merge with existing name metadata', () => {
    class Constructore {}
    Name('Foo')(Constructore);
    Router('/foo')(Constructore);
    const extracted = ControllerRouterMetadata.extract(Constructore);
    expect(extracted).toEqual({ path: '/foo', name: 'Foo' });
  });

  it('should attach name metadata with Name decorator', () => {
    class Constructore {}
    Name('Bar')(Constructore);
    const extracted = ControllerRouterMetadata.extract(Constructore);
    expect(extracted).toEqual({ path: undefined, name: 'Bar' });
  });

  it('should override previous path metadata', () => {
    class Constructore {}
    Router('/foo')(Constructore);
    Router('/bar')(Constructore);
    const extracted = ControllerRouterMetadata.extract(Constructore);
    expect(extracted).toEqual({ path: '/bar', name: undefined });
  });

  it('should attach path metadata with Router decorator', () => {
    class Constructore {}
    Router('/foo')(Constructore);
    const extracted = ControllerRouterMetadata.extract(Constructore);
    expect(extracted).toEqual({ path: '/foo', name: undefined });
  });
})
