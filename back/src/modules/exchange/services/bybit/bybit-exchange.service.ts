import * as ccxt from 'ccxt';

import { ExchangeInitializationException, InvalidCredentialsException } from '../../exceptions/exchange.exceptions';
import { BaseExchangeService } from '../base-exchange.service';

export class BybitExchangeService extends BaseExchangeService {
  async initialize(): Promise<boolean> {
    this.logger.debug(`initialize() - start | accountId=${this.account.id}`);

    try {
      this.exchange = new ccxt.bybit({
        apiKey: this.account.key,
        secret: this.account.secret
      });
      await this.getBalances();
      this.logger.log(`initialize() - success | accountId=${this.account.id}`);
      return true;
    } catch (error) {
      this.logger.error(`initialize() - error | accountId=${this.account.id}, msg=${error.message}`, error.stack);

      if (error instanceof ccxt.AuthenticationError) {
        throw new InvalidCredentialsException(this.account.id);
      } else if (error instanceof ccxt.ExchangeError) {
        throw new ExchangeInitializationException(error.message);
      } else {
        throw error;
      }
    }
  }
}
