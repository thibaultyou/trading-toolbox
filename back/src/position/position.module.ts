import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AccountModule } from '../account/account.module'; // Assuming you have AccountModule that provides AccountService
import { ExchangeModule } from '../exchange/exchange.module';

import { PositionService } from './position.service';

@Module({
  imports: [EventEmitterModule, ExchangeModule, AccountModule], // AccountModule added to the imports
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule {}
