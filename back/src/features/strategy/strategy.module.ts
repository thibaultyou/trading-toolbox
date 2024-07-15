import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

import { OrderModule } from '@order/order.module';
import { TickerModule } from '@ticker/ticker.module';
import { WalletModule } from '@wallet/wallet.module';

import { Strategy } from './entities/strategy.entity';
import { StrategyModuleExecutionReceivedEventHandler } from './handlers/execution-received.strategy.event-handler';
import { StrategyFactory } from './strategies/strategy.factory';
import { StrategyController } from './strategy.controller';
import { StrategyService } from './strategy.service';
import { StrategyOptionsValidator } from './validators/strategy-options.validator';

@Module({
  controllers: [StrategyController],
  exports: [StrategyService],
  imports: [TypeOrmModule.forFeature([Strategy]), OrderModule, TickerModule, WalletModule],
  providers: [StrategyService, StrategyOptionsValidator, StrategyFactory, StrategyModuleExecutionReceivedEventHandler]
})
export class StrategyModule {}
