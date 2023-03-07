import { UnitOfWorkPort } from '@ports/uow';
import { Command } from './BaseCommand';

export abstract class CommandHandlerBase<
  CommandProps,
  CommandHandlerReturnType,
> {
  abstract execute(
    command: Command<CommandProps>,
  ): Promise<CommandHandlerReturnType>;
}

export abstract class UowCommandHandlerBase<
  CommandProps,
  CommandHandlerReturnType = unknown,
> implements CommandHandlerBase<CommandProps, CommandHandlerReturnType>
{
  constructor(protected readonly unitOfWork: UnitOfWorkPort) {}

  // Forces all command handlers to implement a handle method
  abstract handle(
    command: Command<CommandProps>,
  ): Promise<CommandHandlerReturnType>;

  /**
   * Execute a command as a UnitOfWork to include
   * everything in a single atomic database transaction
   */
  execute(command: Command<CommandProps>): Promise<CommandHandlerReturnType> {
    return this.unitOfWork.execute(command.correlationId, async () =>
      this.handle(command),
    );
  }
}
