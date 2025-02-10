import { Injectable, Logger } from '@nestjs/common';

import { Account } from '@account/entities/account.entity';

import { BitgetExchangeService } from './bitget/bitget-exchange.service';
import { BybitExchangeService } from './bybit/bybit-exchange.service';
import { UnsupportedExchangeException } from '../exceptions/exchange.exceptions';
import { IExchangeService } from '../types/exchange-service.interface';
import { ExchangeType } from '../types/exchange-type.enum';

const exchangeRegistry: Record<string, new (account: Account) => IExchangeService> = {
  [ExchangeType.Bybit]: BybitExchangeService,
  [ExchangeType.Bitget]: BitgetExchangeService
};

@Injectable()
export class ExchangeFactory {
  private readonly logger = new Logger(ExchangeFactory.name);

  public async createExchange(account: Account): Promise<IExchangeService> {
    const accountId = account.id;
    this.logger.debug(`createExchange() - start | accountId=${accountId}, exchangeType=${account.exchange}`);

    const ExchangeClass = exchangeRegistry[account.exchange];

    if (!ExchangeClass) {
      this.logger.error(
        `createExchange() - error | accountId=${accountId}, reason=Unsupported exchangeType=${account.exchange}`
      );
      throw new UnsupportedExchangeException(account.exchange);
    }

    try {
      const exchangeInstance = new ExchangeClass(account);
      await exchangeInstance.initialize();

      this.logger.log(`createExchange() - success | accountId=${accountId}, exchangeType=${account.exchange}`);
      return exchangeInstance;
    } catch (error) {
      this.logger.error(
        `createExchange() - error | accountId=${accountId}, exchangeType=${account.exchange}, msg=${error.message}`,
        error.stack
      );
      throw error;
    }
  }
}
