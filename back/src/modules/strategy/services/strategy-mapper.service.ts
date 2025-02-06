import { Injectable } from '@nestjs/common';

import { IBaseMapper } from '@common/interfaces/base-mapper.interface';
import { StrategyCreateRequestDto } from '@strategy/dtos/strategy-create.request.dto';
import { StrategyUpdateRequestDto } from '@strategy/dtos/strategy-update.request.dto';
import { StrategyDto } from '@strategy/dtos/strategy.dto';
import { Strategy } from '@strategy/entities/strategy.entity';

@Injectable()
export class StrategyMapperService
  implements IBaseMapper<Strategy, StrategyDto, StrategyCreateRequestDto, StrategyUpdateRequestDto>
{
  toDto(strategy: Strategy): StrategyDto {
    const dto = new StrategyDto();
    dto.id = strategy.id;
    dto.type = strategy.type;
    dto.marketId = strategy.marketId;
    dto.accountId = strategy.accountId;
    dto.options = strategy.options;
    dto.orders = strategy.orders;
    dto.takeProfitOrderId = strategy.takeProfitOrderId;
    dto.stopLossOrderId = strategy.stopLossOrderId;
    return dto;
  }

  createFromDto(...args: [StrategyCreateRequestDto, string]): Strategy {
    const [dto, userId] = args;
    const strategy = new Strategy();
    strategy.userId = userId;
    strategy.type = dto.type;
    strategy.marketId = dto.marketId;
    strategy.accountId = dto.accountId;
    strategy.options = dto.options;
    strategy.orders = [];
    return strategy;
  }

  updateFromDto(strategy: Strategy, dto: StrategyUpdateRequestDto): Strategy {
    if (dto.type !== undefined) strategy.type = dto.type;

    if (dto.marketId !== undefined) strategy.marketId = dto.marketId;

    if (dto.accountId !== undefined) strategy.accountId = dto.accountId;

    if (dto.options !== undefined) strategy.options = dto.options;
    return strategy;
  }
}
