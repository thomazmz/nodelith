import { RedisClientType } from 'redis';
import { CacheRepository, Cached, Value } from '@nodelith/context'

export class RedisCacheRepository<ValueType extends Value>  implements CacheRepository<ValueType > {
  public constructor(
    private readonly redisClient: RedisClientType,
    private readonly redisPrefix: string,
    private readonly redisTtl: number,
  ) {}

  public async get(key: string): Promise<Cached<ValueType > | undefined> {
    const cachedKey = this.resolvePrefixedKey(key);

    const cachedStringValue = await this.redisClient.GET(cachedKey);

    if(!cachedStringValue) {
      return undefined
    }

    const cachedValue = JSON.parse(cachedStringValue)

    return { ...cachedValue, 
      cachedAt: new Date(cachedValue.cachedAt)
    }
  }

  public async set(key: string, value: ValueType): Promise<Cached<ValueType >> {
    const cacheValue = { key, value, cachedAt: new Date() };
    
    const cacheableValue = JSON.stringify(cacheValue);
    
    const cacheableKey = this.resolvePrefixedKey(key);

    await this.redisClient.SETEX(cacheableKey, this.redisTtl, cacheableValue);

    return cacheValue;
  }

  private resolvePrefixedKey(key: string): string {
    return `${this.redisPrefix}:${key}`;
  }
}