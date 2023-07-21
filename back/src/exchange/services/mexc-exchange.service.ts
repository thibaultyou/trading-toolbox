import * as ccxt from 'ccxt';

import { ExchangeInitializationException } from '../exceptions/exchange.exceptions';

import { AbstractExchangeService } from './abstract-exchange.service';

export class MexcExchangeService extends AbstractExchangeService {
  initialize(): void {
    try {
      this.exchange = new ccxt.mexc({
        apiKey: this.account.key,
        secret: this.account.secret,
      });
    } catch (error) {
      throw new ExchangeInitializationException(error.message);
    }
  }
}
