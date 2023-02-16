export abstract class Query {}

export abstract class QueryHandlerBase<T> {
  // For consistency with a CommandHandlerBase and DomainEventHandler
  abstract handle(query: Query): Promise<T>;

  execute(query: Query): Promise<T> {
    return this.handle(query);
  }
}
