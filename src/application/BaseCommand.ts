import { AssertionConcern } from '@logic/AssertionConcern';
import { nanoid } from 'nanoid';

export class Command<Props> extends AssertionConcern {
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

  public readonly props: Props;

  constructor(props: Props, correlationId?: string) {
    super();
    this.assertArgumentNotNull({
      aValue: props,
      aMessage: 'Command props should not be empty',
      loc: ['command'],
    });
    this.correlationId = correlationId || nanoid(8);
    this.props = props;
  }
}
