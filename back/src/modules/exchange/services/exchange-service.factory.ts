import { Injectable } from '@nestjs/common';
import { Account } from '@account/entities/account.entity';
import { BybitExchangeService } from './bybit/bybit-exchange.service';
import { UnsupportedExchangeException } from '../exchange.exceptions';
import { IExchangeService } from '../types/exchange-service.interface';
import { ExchangeType } from '../types/exchange-type.enum';
import { BitgetExchangeService } from './bitget/bitget-exchange.service';

const exchangeRegistry: Record<string, new (account: Account) => IExchangeService> = {
  [ExchangeType.Bybit]: BybitExchangeService,
  [ExchangeType.Bitget]: BitgetExchangeService,
};

@Injectable()
export class ExchangeFactory {
  public async createExchange(account: Account): Promise<IExchangeService> {
    const ExchangeClass = exchangeRegistry[account.exchange];
    if (!ExchangeClass) {
      throw new UnsupportedExchangeException(account.exchange);
    }
    const exchangeInstance = new ExchangeClass(account);
    await exchangeInstance.initialize();
    return exchangeInstance;
  }
}
