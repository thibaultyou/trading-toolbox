import { WSClientConfigurableOptions } from 'bybit-api';
import * as ccxt from 'ccxt';

import { ExchangeInitializationException } from '../exceptions/exchange.exceptions';

import { AbstractExchangeService } from './abstract-exchange.service';

export class BybitExchangeService extends AbstractExchangeService {
  initialize(): void {
    try {
      this.exchange = new ccxt.bybit({
        apiKey: this.account.key,
        secret: this.account.secret,
      });
      const options: WSClientConfigurableOptions = {
        key: this.account.key,
        secret: this.account.secret,
        testnet: false,
        market: 'contractUSDT',
      };
      this.ws = this.initWs(options);
    } catch (error) {
      throw new ExchangeInitializationException(error.message);
    }
  }
}
