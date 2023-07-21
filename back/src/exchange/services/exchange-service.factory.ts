import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AccountService } from '../../account/account.service';
import { Account } from '../../account/entities/account.entity';
import { IExchangeService } from '../exchange.interfaces';
import { ExchangeType } from '../exchange.types';

import { BybitExchangeService } from './bybit-exchange.service';
import { MexcExchangeService } from './mexc-exchange.service';

@Injectable()
export class ExchangeFactory {
  constructor(
    private accountService: AccountService,
    private eventEmitter: EventEmitter2,
  ) {}

  public createExchange(account: Account): IExchangeService {
    let exchange: IExchangeService;

    switch (account.exchange) {
      case ExchangeType.Bybit:
        exchange = new BybitExchangeService(
          this.accountService,
          this.eventEmitter,
          account,
        );
        break;
      case ExchangeType.MEXC:
        exchange = new MexcExchangeService(
          this.accountService,
          this.eventEmitter,
          account,
        );
        break;
      default:
        throw new Error('Unsupported exchange type');
    }

    return exchange;
  }
}
