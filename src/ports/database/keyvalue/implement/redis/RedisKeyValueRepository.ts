import * as redis from 'redis';
import { AbstractKeyValueRepository } from '../../KeyValueRepository';

type RedisClient = ReturnType<typeof redis.createClient>;
export class RedisKeyValueRepository extends AbstractKeyValueRepository {
  private redisClient: RedisClient;

  constructor(redisClient: RedisClient, prefix: string) {
    super(prefix)
    this.redisClient = redisClient;
  }

  static async factory(
    host: string,
    port: number,
    username: string,
    password: string,
    prefix: string,
  ) {
    const redisClient = redis.createClient({
      url: `redis://${username}:${password}@${host}:${port}`,
    });
    await redisClient.connect();
    return new RedisKeyValueRepository(redisClient, prefix);
  }

  private finalizeKey(key: string) {
    return this.keyWithPrefix(key);
  }

  public async set(
    key: string,
    value: string | number,
    expiredSeconds?: number,
  ): Promise<void> {
    await this.redisClient.set(this.finalizeKey(key), value, {
      EX: expiredSeconds,
    });
  }
  public get(key: string): Promise<string | number> {
    return this.redisClient.get(this.finalizeKey(key));
  }
}
