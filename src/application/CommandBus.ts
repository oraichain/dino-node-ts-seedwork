import { Class } from '@type_util/Class';
import { Command } from './BaseCommand';
import { CommandHandlerBase } from './BaseCommandHandler';

interface HandlerFactory<CommandT extends Command<any>, ReturnType> {
  (): CommandHandlerBase<CommandT, ReturnType>;
}

export class CommandBus {
  private commandMap: Map<string, HandlerFactory<any, any>> = new Map();

  public registerCommand<CommandT extends Command<any>, ReturnType>(
    commandCls: Class<CommandT>,
  ) {
    return (handlerFactory: HandlerFactory<CommandT, ReturnType>) => {
      this.commandMap.set(commandCls.name, handlerFactory);
    };
  }

  static factory() {
    return new CommandBus();
  }

  public batchRegisterCommand(commandClses: Class<Command<any>>[]) {
    return (handlerFactory: HandlerFactory<any, any>) => {
      commandClses.forEach((commandCls) => {
        this.registerCommand(commandCls)(handlerFactory);
      });
    };
  }

  public execute<CommandT extends Command<any>>(command: CommandT) {
    const handlerFactory = this.commandMap.get(command.constructor.name);
    if (handlerFactory == null) {
      return null;
    }
    const handler = handlerFactory();
    return handler.execute(command);
  }
}
