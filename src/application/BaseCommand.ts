import { AssertionConcern } from "@logic/AssertionConcern";
import { UUID } from "@model/valueObjects";
import { ExcludeFunctionProps } from "@type_util/ExcludeFunctionProps";
import { nanoid } from "nanoid";

export type CommandProps<T> = Omit<
  ExcludeFunctionProps<T>,
  "correlationId" | "id" | ""
> &
  Partial<Command>;

export class Command extends AssertionConcern {
  /**
   * Command id, in case if we want to save it
   * for auditing purposes and create a correlation/causation chain
   */
  public readonly id: string;

  /** ID for correlation purposes (for UnitOfWork, for commands that
   *  arrive from other microservices,logs correlation etc). */
  public readonly correlationId: string;

  /**
   * Causation id to reconstruct execution ordering if needed
   */
  public readonly causationId?: string;

  constructor(props: CommandProps<unknown>) {
    super();
    this.assertArgumentNotNull({
      aValue: props,
      aMessage: "Command props should not be empty",
      loc: ["command"],
    });
    this.correlationId = props.correlationId || nanoid(8);
    this.id = props.id || UUID.generate().toValue();
  }
}
