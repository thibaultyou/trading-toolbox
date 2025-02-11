import { Injectable } from '@nestjs/common';
import { Position } from 'ccxt';

import { IBaseMapper } from '@common/interfaces/base-mapper.interface';
import { getUnifiedOrderSide } from '@order/order.utils';
import { PositionDto } from '@position/dtos/position.dto';
import { fromSymbolToMarketId } from '@position/position.utils';
import { IPosition } from '@position/types/position.interface';

@Injectable()
export class PositionMapperService implements IBaseMapper<IPosition, PositionDto> {
  toDto(position: IPosition): PositionDto {
    return new PositionDto(position);
  }

  fromExternal(external: any): IPosition {
    const position: Position = external;
    return {
      marketId: fromSymbolToMarketId(position.symbol),
      side: getUnifiedOrderSide(position.info),
      avgPrice: position.entryPrice,
      positionValue: position.notional,
      leverage: position.leverage,
      unrealisedPnl: position.unrealizedPnl,
      markPrice: position.markPrice,
      amount: position.contracts,
      stopLossPrice: position.stopLossPrice,
      takeProfitPrice: position.takeProfitPrice,
      tpslMode: position.info.tpslMode ?? 'FULL'
    };
  }
}
