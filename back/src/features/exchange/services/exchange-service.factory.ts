import { Injectable } from '@nestjs/common';

import { Account } from '../../account/entities/account.entity';
import { UnsupportedExchangeException } from '../exceptions/exchange.exceptions';
import { IExchangeService } from '../exchange.interfaces';
import { ExchangeType } from '../exchange.types';
import { BybitExchangeService } from './bybit-exchange.service';

@Injectable()
export class ExchangeFactory {
  public async createExchange(account: Account): Promise<IExchangeService> {
    let exchange: IExchangeService;
    switch (account.exchange) {
      case ExchangeType.Bybit:
        exchange = new BybitExchangeService(account);
        break;
      default:
        throw new UnsupportedExchangeException(account.exchange);
    }

    await exchange.initialize();
    return exchange;
  }
}
