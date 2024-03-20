import * as ccxt from 'ccxt';

import {
  ExchangeInitializationException,
  InvalidCredentialsException,
} from '../exceptions/exchange.exceptions';

import { AbstractExchangeService } from './abstract-exchange.service';

export class MexcExchangeService extends AbstractExchangeService {
  async initialize(): Promise<void> {
    try {
      this.exchange = new ccxt.mexc({
        apiKey: this.account.key,
        secret: this.account.secret,
      });

      await this.testCredentials();
    } catch (error) {
      if (error instanceof ccxt.AuthenticationError) {
        throw new InvalidCredentialsException(this.account.name);
      }
      throw new ExchangeInitializationException(error.message);
    }
  }
}
