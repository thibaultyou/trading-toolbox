import * as ccxt from 'ccxt';
import { pipe } from 'fp-ts/function';
import * as TE from 'fp-ts/TaskEither';

import { Account } from '../../account/entities/account.entity';
import { ExchangeInitializationException, InvalidCredentialsException } from '../exceptions/exchange.exceptions';
import { AbstractExchangeService } from './abstract-exchange.service';

export class BybitExchangeService extends AbstractExchangeService {
  constructor(account: Account) {
    super(account);
  }

  async initialize(): Promise<boolean> {
    try {
      this.exchange = new ccxt.bybit({
        apiKey: this.account.key,
        secret: this.account.secret
      });
      return pipe(
        this.getBalances(),
        TE.match(
          (error) => {
            throw error;
          },
          () => true
        )
      )();
    } catch (error) {
      if (error instanceof ccxt.AuthenticationError) {
        throw new InvalidCredentialsException(this.account.name);
      }

      throw new ExchangeInitializationException(error.message);
    }
  }
}
