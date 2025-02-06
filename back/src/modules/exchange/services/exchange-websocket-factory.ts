import { Injectable, Logger } from '@nestjs/common';

import { BitgetWebsocketManagerService } from './bitget/bitget-websocket-manager.service';
import { BybitWebsocketManagerService } from './bybit/bybit-websocket-manager.service';
import { UnsupportedExchangeException } from '../exceptions/exchange.exceptions';
import { ExchangeType } from '../types/exchange-type.enum';
import { IExchangeWebsocketService } from '../types/exchange-websocket-service.interface';

@Injectable()
export class ExchangeWebsocketFactory {
  private readonly logger = new Logger(ExchangeWebsocketFactory.name);

  constructor(
    private readonly bybitWsService: BybitWebsocketManagerService,
    private readonly bitgetWsService: BitgetWebsocketManagerService
  ) {}

  getWebsocketService(exchangeType: ExchangeType): IExchangeWebsocketService {
    this.logger.debug(`getWebsocketService() - start | exchangeType=${exchangeType}`);

    switch (exchangeType) {
      case ExchangeType.Bybit:
        this.logger.log(`getWebsocketService() - success | exchangeType=${exchangeType}`);
        return this.bybitWsService;

      case ExchangeType.Bitget:
        this.logger.log(`getWebsocketService() - success | exchangeType=${exchangeType}`);
        return this.bitgetWsService;

      default:
        this.logger.error(`getWebsocketService() - error | reason=Unsupported exchangeType=${exchangeType}`);
        throw new UnsupportedExchangeException(exchangeType);
    }
  }
}
