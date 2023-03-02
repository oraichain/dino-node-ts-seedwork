import { FutureArbFnc } from "@type_util/function";
import { Replies } from "amqplib";
import { BrokerComponent } from "./BrokerComponent";
import { ConnectionSettings } from "./ConnectionSetting";

export enum ExchangeType {
  DIRECT = "direct",
  TOPIC = "topic",
  HEADERS = "headers",
  FANOUT = "fanout",
  MATCH = "match",
}

export class Exchange extends BrokerComponent {
  private _isExchangeReady: boolean;
  private _type: ExchangeType;
  private _rawExchange: Replies.AssertExchange;

  constructor(
    aConnSettings: ConnectionSettings,
    aName: string,
    aType: ExchangeType,
    isDurable: boolean,
    onSetupFinish?: FutureArbFnc,
    onSetupError?: FutureArbFnc
  ) {
    super({
      init: { aConnectionSettings: aConnSettings, aName },
      onSetupError,
      onSetupFinish,
    });
    this.setIsDurable(isDurable);
    this.setExchangeType(aType);
  }

  static directInstance(
    aConnSettings: ConnectionSettings,
    aName: string,
    isDurable: boolean,
    onSetupFinish?: FutureArbFnc,
    onSetupError?: FutureArbFnc
  ) {
    return new Exchange(
      aConnSettings,
      aName,
      ExchangeType.DIRECT,
      isDurable,
      onSetupFinish,
      onSetupError
    );
  }

  static async asyncDirectInstance(
    aConnSettings: ConnectionSettings,
    aName: string,
    isDurable: boolean
  ) {
    const exchange: Exchange = await new Promise((resolve, reject) => {
      Exchange.directInstance(
        aConnSettings,
        aName,
        isDurable,
        async (exchange) => {
          resolve(exchange);
        },
        async (error) => {
          reject(error);
        }
      );
    });
    return exchange;
  }

  static fanoutInstance(
    aConnSettings: ConnectionSettings,
    aName: string,
    isDurable: boolean,
    onSetupFinish?: FutureArbFnc,
    onSetupError?: FutureArbFnc
  ) {
    return new Exchange(
      aConnSettings,
      aName,
      ExchangeType.FANOUT,
      isDurable,
      onSetupFinish,
      onSetupError
    );
  }

  static headerInstance(
    aConnSettings: ConnectionSettings,
    aName: string,
    isDurable: boolean,
    onSetupFinish?: FutureArbFnc,
    onSetupError?: FutureArbFnc
  ) {
    return new Exchange(
      aConnSettings,
      aName,
      ExchangeType.HEADERS,
      isDurable,
      onSetupFinish,
      onSetupError
    );
  }

  async setup(onSetupFinish: FutureArbFnc): Promise<void> {
    console.info(`[EXCHANGE] setup exchange ${this.getName()} start`);
    this._rawExchange = await this.getChannel().assertExchange(
      this.getName(),
      this.exchangeType(),
      {
        durable: this.isDurable(),
      }
    );

    console.info(`[EXCHANGE] declare exchange ${this.getName()} successfully`);
    this.setExchangeReadyStatus(true);
    if (onSetupFinish) {
      await onSetupFinish(this);
    }
  }

  isExchange() {
    return true;
  }

  isExchangeReady() {
    return this._isExchangeReady;
  }

  setExchangeReadyStatus(aBool: boolean) {
    this._isExchangeReady = aBool;
  }

  exchangeType(): ExchangeType {
    return this._type;
  }

  rawExchange(): Replies.AssertExchange {
    return this._rawExchange;
  }

  setExchangeType(anExchangeType: ExchangeType) {
    this._type = anExchangeType;
  }
}
