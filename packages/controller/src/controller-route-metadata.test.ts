import z from 'zod'
import { Path } from './controller-route-metadata'
import { Method } from './controller-route-metadata'
import { Success } from './controller-route-metadata'
import { Summary } from './controller-route-metadata'
import { Operation } from './controller-route-metadata'
import { Description } from './controller-route-metadata'
import { ControllerRouteMetadata } from './controller-route-metadata'

describe('Metadata', () => {
  it('should merge metadata fields', () => {
    const descriptor = { value: function() {} }
    ControllerRouteMetadata.attach(descriptor, { method: 'post', summary: 'sum', key: 'k1' });
    ControllerRouteMetadata.attach(descriptor, { description: 'desc', key: 'k1' });
    const extracted = ControllerRouteMetadata.extract(descriptor);
    expect(extracted).toEqual({
      description: 'desc',
      operation: undefined,
      summary: 'sum',
      success: undefined,
      method: 'post',
      path: undefined,
      key: 'k1',
    })
  });

  it('should override metadata fields', () => {
    const descriptor = { value: function() {} }
    ControllerRouteMetadata.attach(descriptor, { method: 'post', key: 'k1' });
    ControllerRouteMetadata.attach(descriptor, { description: 'desc', method: 'get', key: 'k1' });
    const extracted = ControllerRouteMetadata.extract(descriptor);
    expect(extracted).toEqual({
      description: 'desc',
      operation: undefined,
      summary: undefined,
      success: undefined,
      method: 'get',
      path: undefined,
      key: 'k1',
    })
  });

  it('should return empty metadata', () => {
    const descriptor = { value: function() {} }
    const extracted = ControllerRouteMetadata.extract(descriptor);
    expect(extracted).toEqual({
      description: undefined,
      operation: undefined,
      summary: undefined,
      success: undefined,
      method: undefined,
      path: undefined,
      key: undefined,
    });
  });

  it('should return empty metadata when descriptor.value is missing', () => {
    const descriptor = {} as any
    ControllerRouteMetadata.attach(descriptor, { description: 'desc', key: 'k1' })
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted).toEqual({
      description: undefined,
      operation: undefined,
      summary: undefined,
      success: undefined,
      method: undefined,
      path: undefined,
      key: undefined
    });
  });

  it('should attach summary metadata with Summary decorator', () => {
    const descriptor = { value: function() {} }
    Summary('sum')(null, 'k1', descriptor)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted).toEqual({
      description: undefined,
      operation: undefined,
      summary: 'sum',
      success: undefined,
      method: undefined,
      path: undefined,
      key: 'k1',
    })
  });

  it('should attach description metadata with Description decorator', () => {
    const descriptor = { value: function() {} }
    Description('desc')(null, 'k1', descriptor)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted).toEqual({
      description: 'desc',
      operation: undefined,
      summary: undefined,
      success: undefined,
      method: undefined,
      path: undefined,
      key: 'k1',
    })
  });

  it('should attach operation metadata with Operation decorator', () => {
    const descriptor = { value: function() {} }
    Operation('op')(null, 'k1', descriptor)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted).toEqual({
      description: undefined,
      operation: 'op',
      summary: undefined,
      success: undefined,
      method: undefined,
      path: undefined,
      key: 'k1',
    })
  });

  it('should attach success metadata with Success decorator', () => {
    const descriptor = { value: function() {} }
    Success(200)(null, 'k1', descriptor)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted).toEqual({
      description: undefined,
      operation: undefined,
      summary: undefined,
      success: 200,
      method: undefined,
      path: undefined,
      key: 'k1',
    })
  });

  it('should attach method metadata with Method decorator', () => {
    const descriptor = { value: function() {} }
    Method('get')(null, 'k1', descriptor)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted).toEqual({
      description: undefined,
      operation: undefined,
      summary: undefined,
      success: undefined,
      method: 'get',
      path: undefined,
      key: 'k1',
    })
  });

  it('should attach path metadata with Path decorator', () => {
    const descriptor = { value: function() {} }
    Path('/foo')(null, 'k1', descriptor)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted).toEqual({
      description: undefined,
      operation: undefined,
      summary: undefined,
      success: undefined,
      method: undefined,
      path: '/foo',
      key: 'k1',
    })
  });

  it('should attach summary metadata with Summary decorator', () => {
    const descriptor = { value: function() {} }
    Summary('summary-value')(null, 'k1', descriptor)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted).toEqual({
      description: undefined,
      operation: undefined,
      summary: 'summary-value',
      success: undefined,
      method: undefined,
      path: undefined,
      key: 'k1',
    })
  });

  it('should attach description metadata with Description decorator', () => {
    const descriptor = { value: function() {} }
    Description('desc-value')(null, 'k1', descriptor)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted).toEqual({
      description: 'desc-value',
      operation: undefined,
      summary: undefined,
      success: undefined,
      method: undefined,
      path: undefined,
      key: 'k1',
    })
  });

  it('should attach operation metadata with Operation decorator', () => {
    const descriptor = { value: function() {} }
    Operation('operation-value')(null, 'k1', descriptor)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted).toEqual({
      description: undefined,
      operation: 'operation-value',
      summary: undefined,
      success: undefined,
      method: undefined,
      path: undefined,
      key: 'k1',
    })
  });

  it('should attach success metadata with Success decorator', () => {
    const descriptor = { value: function() {} }
    Success(201)(null, 'k1', descriptor)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted).toEqual({
      description: undefined,
      operation: undefined,
      summary: undefined,
      success: 201,
      method: undefined,
      path: undefined,
      key: 'k1',
    })
  });

  it('should attach method metadata with Method decorator', () => {
    const descriptor = { value: function() {} }
    Method('put')(null, 'k1', descriptor)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted).toEqual({
      description: undefined,
      operation: undefined,
      summary: undefined,
      success: undefined,
      method: 'put',
      path: undefined,
      key: 'k1',
    })
  });

  it('should attach path metadata with Path decorator', () => {
    const descriptor = { value: function() {} }
    Path('/bar')(null, 'k1', descriptor)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted).toEqual({
      description: undefined,
      operation: undefined,
      summary: undefined,
      success: undefined,
      method: undefined,
      path: '/bar',
      key: 'k1',
    })
  });

  it('should attach response schema with Success decorator', () => {
    const descriptor = { value: function() {} }
    const schema = z.object({
      id: z.string(),
      tags: z.array(z.string()),
      meta: z.record(z.string(), z.union([z.string(), z.number(), z.boolean(), z.null(), z.array(z.string())]))
    })
    Success(200, schema)(null as any, 'k1', descriptor as any)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted.response).toBe(schema)
  });

  it('should attach body schema with Body decorator', () => {
    const descriptor = { value: function() {} }
    const schema = z.array(z.object({
      name: z.string(),
      count: z.number(),
      flags: z.array(z.boolean())
    }))
    require('./controller-route-metadata').Body(schema)(null as any, 'k1', descriptor as any)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted.body).toBe(schema)
  });

  it('should attach query schema with Query decorator', () => {
    const descriptor = { value: function() {} }
    const schema = z.object({
      page: z.number(),
      filter: z.object({ q: z.string().optional() }).optional(),
      include: z.array(z.string()).optional()
    })
    require('./controller-route-metadata').Query(schema)(null as any, 'k1', descriptor as any)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted.query).toBe(schema)
  });

  it('should attach header schema with Header decorator', () => {
    const descriptor = { value: function() {} }
    const schema = z.object({
      'x-request-id': z.string(),
      'x-flags': z.array(z.string())
    })
    require('./controller-route-metadata').Header(schema)(null as any, 'k1', descriptor as any)
    const extracted = ControllerRouteMetadata.extract(descriptor)
    expect(extracted.header).toBe(schema)
  });
})
