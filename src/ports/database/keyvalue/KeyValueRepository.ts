export abstract class AbstractKeyValueRepository {
  protected _prefix: string;

  constructor(prefix: string) {
    this._prefix = prefix;
  }

  public prefix(): string {
    return this._prefix;
  }

  public abstract set(
    key: string,
    value: string | number,
    expired_seconds?: number,
  ): Promise<void>;

  public abstract get(key: string): Promise<string | number>;
}
