import * as ccxt from 'ccxt';

import { ExchangeInitializationException, InvalidCredentialsException } from '../exceptions/exchange.exceptions';
import { AbstractExchangeService } from './abstract-exchange.service';

export class BybitExchangeService extends AbstractExchangeService {
  async initialize(): Promise<boolean> {
    try {
      this.exchange = new ccxt.bybit({
        apiKey: this.account.key,
        secret: this.account.secret
      });

      await this.testCredentials();

      return true;
    } catch (error) {
      if (error instanceof ccxt.AuthenticationError) {
        throw new InvalidCredentialsException(this.account.name);
      }

      throw new ExchangeInitializationException(error.message);
    }
  }
}
