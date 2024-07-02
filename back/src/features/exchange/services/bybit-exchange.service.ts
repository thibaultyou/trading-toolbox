import * as ccxt from 'ccxt';

import { Account } from '../../account/entities/account.entity';
import { ExchangeInitializationException, InvalidCredentialsException } from '../exchange.exceptions';
import { BaseExchangeService } from './base-exchange.service';

export class BybitExchangeService extends BaseExchangeService {
  constructor(account: Account) {
    super(account);
  }

  async initialize(): Promise<boolean> {
    try {
      this.exchange = new ccxt.bybit({
        apiKey: this.account.key,
        secret: this.account.secret
      });
      await this.getBalances();
      return true;
      // return pipe(
      //   this.getBalances(),
      //   TE.match(
      //     (error) => {
      //       throw error;
      //     },
      //     () => true
      //   )
      // )();
    } catch (error) {
      if (error instanceof ccxt.AuthenticationError) {
        throw new InvalidCredentialsException(this.account.name);
      }

      throw new ExchangeInitializationException(error.message);
    }
  }
}
