import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AccountModule } from '../account/account.module';
import { PositionService } from './position.service';

@Module({
  imports: [EventEmitterModule, AccountModule],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule {}
