import { Class } from '@type_util/Class';
import { Command } from './BaseCommand';
import { CommandHandlerBase } from './BaseCommandHandler';

interface HandlerFactory {
  <CommandProps, ReturnType>(): CommandHandlerBase<CommandProps, ReturnType>;
}

export class CommandBus {
  private commandMap: Map<string, HandlerFactory> = new Map();

  public registerCommand<CommandProps>(
    commandCls: Class<Command<CommandProps>>,
  ) {
    return (handlerFactory: HandlerFactory) => {
      this.commandMap.set(commandCls.name, handlerFactory);
    };
  }

  static factory() {
    return new CommandBus();
  }

  public batchRegisterCommand(commandClses: Class<Command<any>>[]) {
    return (handlerFactory: HandlerFactory) => {
      commandClses.forEach((commandCls) => {
        this.registerCommand(commandCls)(handlerFactory);
      });
    };
  }

  public execute<CommandProps>(command: Command<CommandProps>) {
    const handlerFactory = this.commandMap.get(command.constructor.name);
    if (handlerFactory == null) {
      return null;
    }
    const handler = handlerFactory();
    return handler.execute(command);
  }
}
