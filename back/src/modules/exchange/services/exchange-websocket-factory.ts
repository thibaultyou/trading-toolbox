import { Injectable } from '@nestjs/common';
import { ExchangeType } from '../types/exchange-type.enum';
import { UnsupportedExchangeException } from '../exchange.exceptions';

import { BitgetWebsocketManagerService } from './bitget/bitget-websocket-manager.service';
import { BybitWebsocketManagerService } from './bybit/bybit-websocket-manager.service';
import { IExchangeWebsocketService } from '../types/exchange-websocket-service.interface';

@Injectable()
export class ExchangeWebsocketFactory {
  constructor(
    private readonly bybitWsService: BybitWebsocketManagerService,
    private readonly bitgetWsService: BitgetWebsocketManagerService,
  ) {}

  getWebsocketService(exchangeType: ExchangeType): IExchangeWebsocketService {
    switch (exchangeType) {
      case ExchangeType.Bybit:
        return this.bybitWsService;
      case ExchangeType.Bitget:
        return this.bitgetWsService;
      default:
        throw new UnsupportedExchangeException(exchangeType);
    }
  }
}
