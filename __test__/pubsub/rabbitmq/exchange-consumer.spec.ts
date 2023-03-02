import {
  MessageType,
  ConnectionSettings,
  Exchange,
  ExchangeListener,
} from "@ports/pubsub/rabbitmq";
import { UUID } from "src";
import { MockEventHandlingTracker } from "../mock/MockEventHandlingTracker";

describe("Exchange Listener", () => {
  let connectionSetting = null;
  const exchangeName = "exchange_for_test_exchange_listener";
  const messageTypes = ["test_message_type"];
  // init an random queueName to prevent consumer of test receive any event that emitted in the pass
  const queueName = `queue_for_test_exchange_listener_${UUID.generate().toString()}`;
  let exchanges = [];

  beforeAll(() => {
    connectionSetting = ConnectionSettings.factory(
      "localhost",
      5672,
      "dino_ai_market",
      "dino_123456",
      "dino_ai_market"
    );
  });

  class AbstractMockListener extends ExchangeListener {
    // isDurable = false;
    connectionSetting = connectionSetting;
    label = "MockListener";
    constructor() {
      super();
      this.factory();
      this.eventHandlingTracker = new MockEventHandlingTracker();
    }

    override exchangeName(): string {
      return exchangeName;
    }

    override listenTo(): string[] {
      return messageTypes;
    }

    override queueName(): string {
      return queueName;
    }
    async handle(
      aType: string,
      aMessageId: string,
      aTimeStamp: Date,
      aMessage: string,
      aDeliveryTag: number,
      isRedelivery: boolean
    ) {
      return null;
    }

    async filteredDispatch(
      aType: string,
      aMessageId: string,
      aTimeStamp: Date,
      aMessage: string,
      aDeliveryTag: number,
      isRedelivery: boolean
    ): Promise<void> {
      console.log(`Handle message [type] ${aType} [content] ${aMessage}`);
      await this.handle(
        aType,
        aMessageId,
        aTimeStamp,
        aMessage,
        aDeliveryTag,
        isRedelivery
      );
    }
  }

  describe("Constructor", () => {
    jest.setTimeout(40000);

    const getExchangeFromListener = async (listener: ExchangeListener) => {
      const exchange: Exchange = await new Promise((resolve, reject) => {
        if (listener.isReadyForConsuming()) {
          resolve(listener.getExchange());
        } else {
          listener.registerOnReady(() => {
            resolve(listener.getExchange());
          });
        }
      });
      return exchange;
    };

    const pushMessageByExchange = (exchange: Exchange, messageId: string) => {
      exchange
        .getChannel()
        .publish(exchangeName, "", Buffer.from("this is message", "utf-8"), {
          type: messageTypes[0],
          contentEncoding: "utf-8",
          deliveryMode: 2,
          contentType: MessageType.TEXT,
          messageId,
        });
    };
    it("normally constructing", async () => {
      let handled = false;
      // let exchange: Exchange = null;
      let listener: ExchangeListener = null;
      await new Promise(async (resolve, reject) => {
        const messageId = UUID.generate().toString();
        class MockListener extends AbstractMockListener {
          // isDurable = false;
          override async handle(
            aType: string,
            aMessageId: string,
            aTimeStamp: Date,
            aMessage: string,
            aDeliveryTag: number,
            isRedelivery: boolean
          ): Promise<void> {
            if (aMessageId === messageId) {
              handled = true;
              resolve(aMessage);
            }
          }
        }
        try {
          listener = new MockListener();

          expect(listener.label).toBe("MockListener");
          expect(listener.connectionSetting).toBe(connectionSetting);

          // when listener ready

          const _exchange: Exchange = await getExchangeFromListener(listener);

          exchanges.push(_exchange);
          // exchange = _exchange;
          pushMessageByExchange(_exchange, messageId);
        } catch (error) {
          reject(error);
        }
      });
      expect(handled).toBe(true);
      // const spyOnAck = jest.spyOn(exchange.getChannel(), "ack");
      // expect(spyOnAck).toHaveBeenCalled();
    });

    it("constructing durable listener", async () => {
      let handled = false;
      // let exchange: Exchange = null;
      let listener: ExchangeListener = null;
      const messageId = UUID.generate().toString();
      await new Promise(async (resolve, reject) => {
        class MockListener extends AbstractMockListener {
          isDurable = false;
          override async handle(
            aType: string,
            aMessageId: string,
            aTimeStamp: Date,
            aMessage: string,
            aDeliveryTag: number,
            isRedelivery: boolean
          ): Promise<void> {
            handled = true;
            console.log(
              "durable constructing receive message",
              messageId,
              aMessageId
            );
            if (aMessageId === messageId) {
              console.log("constructing durable listener oke");
              resolve(aMessage);
            }
          }
        }
        try {
          listener = new MockListener();

          expect(listener.label).toBe("MockListener");
          expect(listener.connectionSetting).toBe(connectionSetting);

          // when listener ready

          const _exchange: Exchange = await getExchangeFromListener(listener);

          exchanges.push(_exchange);
          // exchange = _exchange;
          pushMessageByExchange(_exchange, messageId);
        } catch (error) {
          reject(error);
        }
      });
      expect(handled).toBe(true);
    });
  });
  afterEach(async () => {
    await Promise.all(exchanges.map((exchange: Exchange) => exchange.close()));
    exchanges = [];
  });
});
