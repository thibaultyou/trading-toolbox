import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AccountModule } from '../account/account.module';
import { SetupModule } from '../setup/setup.module';

import { SetupCreatedHandler } from './handlers/setup-created.event-handler';
import { TickerUpdateHandler } from './handlers/update-ticker.event-handler';
import { TickerController } from './ticker.controller';
import { TickerService } from './ticker.service';

@Module({
  imports: [EventEmitterModule, SetupModule, AccountModule],
  providers: [TickerUpdateHandler, SetupCreatedHandler, TickerService],
  controllers: [TickerController],
  exports: [TickerService],
})
export class TickerModule {}
