import { UnitOfWorkPort } from "src/ports/uow";
import { Command } from "./BaseCommand";

export abstract class CommandHandlerBase<CommandHandlerReturnType = unknown> {
  abstract execute(command: Command): Promise<CommandHandlerReturnType>;
}

export abstract class UowCommandHandlerBase<CommandHandlerReturnType = unknown>
  implements CommandHandlerBase
{
  constructor(protected readonly unitOfWork: UnitOfWorkPort) {}

  // Forces all command handlers to implement a handle method
  abstract handle(command: Command): Promise<CommandHandlerReturnType>;

  /**
   * Execute a command as a UnitOfWork to include
   * everything in a single atomic database transaction
   */
  execute(command: Command): Promise<CommandHandlerReturnType> {
    return this.unitOfWork.execute(command.correlationId, async () =>
      this.handle(command)
    );
  }
}