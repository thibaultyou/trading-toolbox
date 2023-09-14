import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AccountModule } from '../account/account.module';
import { ExchangeModule } from '../exchange/exchange.module';

import { PositionService } from './position.service';

@Module({
  imports: [EventEmitterModule, ExchangeModule, AccountModule],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule {}
