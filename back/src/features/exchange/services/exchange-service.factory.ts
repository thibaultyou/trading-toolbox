import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Account } from '../../account/entities/account.entity';
import { UnsupportedExchangeException } from '../exceptions/exchange.exceptions';
import { IExchangeService } from '../exchange.interfaces';
import { ExchangeType } from '../exchange.types';

import { BybitExchangeService } from './bybit-exchange.service';
import { MexcExchangeService } from './mexc-exchange.service';

@Injectable()
export class ExchangeFactory {
  constructor(private eventEmitter: EventEmitter2) {}

  public async createExchange(account: Account): Promise<IExchangeService> {
    let exchange: IExchangeService;

    switch (account.exchange) {
      case ExchangeType.Bybit:
        exchange = new BybitExchangeService(this.eventEmitter, account);
        break;
      case ExchangeType.MEXC:
        exchange = new MexcExchangeService(this.eventEmitter, account);
        break;
      default:
        throw new UnsupportedExchangeException(account.exchange);
    }

    await exchange.initialize();
    return exchange;
  }
}
