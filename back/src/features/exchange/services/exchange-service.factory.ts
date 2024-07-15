import { Injectable } from '@nestjs/common';

import { Account } from '@account/entities/account.entity';

import { BybitExchangeService } from './bybit-exchange.service';
import { UnsupportedExchangeException } from '../exchange.exceptions';
import { IExchangeService } from '../types/exchange-service.interface';
import { ExchangeType } from '../types/exchange-type.enum';

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
