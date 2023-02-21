import { Class } from "@type_util/Class";
import { Command } from "./BaseCommand";
import { CommandHandlerBase } from "./BaseCommandHandler";

type HandlerFactory = () => CommandHandlerBase;

export class CommandBus {
  private commandMap: Map<string, HandlerFactory> = new Map();

  public registerCommand =
    (commandCls: Class<Command>) => (handlerFactory: HandlerFactory) => {
      this.commandMap.set(commandCls.name, handlerFactory);
    };

  public execute(command: Command) {
    const handlerFactory = this.commandMap.get(command.constructor.name);
    if (handlerFactory == null) {
      return null;
    }
    const handler = handlerFactory();
    return handler.execute(command);
  }
}
