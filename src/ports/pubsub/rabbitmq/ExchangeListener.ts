import { catchException } from '@logic/exceptions';
import { ConsoleDomainLogger } from '@ports/DomainLogger';
import { ArbFunction } from '@type_util/function';
import { EventHandlingTracker } from '../EventHandlingTracker';
import { ConnectionSettings } from './ConnectionSetting';
import { Exchange } from './Exchange';
import { MessageConsumer } from './MessageConsumer';
import { MessageListener } from './MessageListener';
import { MessageType } from './MessageType';
import { Queue } from './Queue';

export class ExchangeListener {
  private messageConsumer?: MessageConsumer;
  private queue?: Queue;
  private exchange?: Exchange;
  private isReady = false;

  isDurable = true;
  connectionSetting: ConnectionSettings;
  queueDurable = true;
  queueAutoDeleted = false;
  autoAck = false;
  isRetry = false;
  isExclusive = true;
  label = '';
  logger: ConsoleDomainLogger;
  eventHandlingTracker: EventHandlingTracker;

  private onReady?: ArbFunction;

  constructor(eventHandlingTracker: EventHandlingTracker) {
    this.logger = new ConsoleDomainLogger();
    this.logger.setContext(`ExchangeListener ${this.label}`);
    this.eventHandlingTracker = eventHandlingTracker;
  }

  start() {
    this.attachToQueue();
  }

  registerOnReady(cb: ArbFunction) {
    this.onReady = cb;
  }

  getMessageConsumer(): MessageConsumer | null {
    return this.messageConsumer;
  }

  setMessageConsumer(aMessageConsumer: MessageConsumer) {
    this.messageConsumer = aMessageConsumer;
  }

  checkIfReady() {
    return this.isReady;
  }

  async close() {
    if (this.queue) {
      await this.queue.close();
    }
  }
  /*
  Answers the String name of the exchange I listen to.
  @return str
  */
  exchangeName(): string {
    throw Error('This method need to be overridden');
  }

  filteredDispatch(
    aType: string,
    aMessageId: string,
    aTimeStamp: Date,
    aMessage: string,
    aDeliveryTag: number,
    isRedelivery: boolean,
  ): Promise<void> {
    throw Error('This method need to be overridden');
  }

  /*
  Answers the kinds of messages I listen to.
  @return: List[str]
  */
  listenTo(): string[] {
    throw Error('This method need to be overridden');
  }
  /*
  Answers the str name of the queue I listen to. By
  default it is the simple name of my concrete class.
  May be overridden to change the name.
  @return: str
  */
  queueName(): string {
    throw Error('This method need to be overridden');
  }

  setExchange(anExchange: Exchange) {
    this.exchange = anExchange;
  }

  getExchange() {
    return this.exchange;
  }

  setQueue(aQueue: Queue) {
    this.queue = aQueue;
  }

  attachToQueue() {
    const exchange = Exchange.fanoutInstance(
      this.connectionSetting,
      this.exchangeName(),
      this.isDurable,
      (async (exchange: Exchange) => {
        this.logger.info('Exchange declaring finished');
        const queue = Queue.factoryExchangeSubcriber(
          exchange,
          this.queueName(),
          this.queueDurable,
          this.queueAutoDeleted,
          this.isExclusive,
          this.registerConsumer.bind(this),
        );
        this.setQueue(queue);
      }).bind(this),
    );
    this.setExchange(exchange);
  }

  private async idempotentHandleDispatch(
    aType: string,
    aMessageId: string,
    aTimeStamp: Date,
    aMessage: Buffer,
    aDeliveryTag: number,
    isRedelivery: boolean,
  ) {
    const idempotentHandle = async (isHandled: boolean) => {
      if (!isHandled) {
        await this.filteredDispatch(
          aType,
          aMessageId,
          aTimeStamp,
          aMessage.toString(), // utf8 decode
          aDeliveryTag,
          isRedelivery,
        );
        await this.eventHandlingTracker.markNotifAsHandled(aMessageId);
      }
    };
    const isEventHandled = await this.eventHandlingTracker.checkIfNotifHandled(
      aMessageId,
    );
    await idempotentHandle(isEventHandled);
  }

  async registerConsumer(queue: Queue) {
    this.logger.info('Queue declaring finished, now register consumer');
    const idempotentHandleDispatch = this.idempotentHandleDispatch.bind(this);
    class MessageListenerAdapter extends MessageListener {
      handleMessage(
        aType: string,
        aMessageId: string,
        aTimeStamp: Date,
        aMessage: Buffer,
        aDeliveryTag: number,
        isRedelivery: boolean,
      ) {
        return idempotentHandleDispatch(
          aType,
          aMessageId,
          aTimeStamp,
          aMessage,
          aDeliveryTag,
          isRedelivery,
        );
      }
    }
    const messageConsumer = await MessageConsumer.factory(
      queue,
      this.autoAck,
      this.isRetry,
      this.label,
    );
    this.setMessageConsumer(messageConsumer);
    await messageConsumer.receiveOnly(
      this.listenTo(),
      new MessageListenerAdapter(MessageType.TEXT),
    );
    this.logger.info('Message Consumer registered successfully');
    this.isReady = true;
    if (this.onReady) {
      this.onReady(this);
    }
  }

  isReadyForConsuming(): boolean {
    return this.messageConsumer?.isConsuming?.() || false;
  }

  async stop() {
    const messageConsumer = this.messageConsumer;
    await messageConsumer.close();
  }
}
