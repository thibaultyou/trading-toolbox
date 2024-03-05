import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AccountModule } from '../account/account.module';
import { ExchangeModule } from '../exchange/exchange.module';
import { BalanceController } from './balance.controller';
import { BalanceGateway } from './balance.gateway';
import { BalanceService } from './balance.service';
import { BalanceUpdateHandler } from './handlers/update-balance.event-handler';

@Module({
  imports: [EventEmitterModule, ExchangeModule, AccountModule],
  providers: [BalanceService, BalanceGateway, BalanceUpdateHandler],
  controllers: [BalanceController],
  exports: [BalanceService],
})
export class BalanceModule {}
