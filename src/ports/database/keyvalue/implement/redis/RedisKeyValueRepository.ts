export class RedisKeyValueRepository extends AbstractKeyValueRepository {
  public set(key: string, value: string | number, expired_seconds?: number): void {
    return null
  }
  public get(key: string): string | number {
    return ""
  }
}
