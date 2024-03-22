import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { BalanceController } from './balance.controller';
import { BalanceGateway } from './balance.gateway';
import { BalanceService } from './balance.service';
import { BalanceUpdateHandler } from './handlers/update-balances.event-handler';

@Module({
  imports: [EventEmitterModule],
  providers: [BalanceService, BalanceGateway, BalanceUpdateHandler],
  controllers: [BalanceController],
  exports: [BalanceService],
})
export class BalanceModule {}
