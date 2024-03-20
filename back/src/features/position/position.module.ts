import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { PositionService } from './position.service';

@Module({
  imports: [EventEmitterModule],
  providers: [PositionService],
  exports: [PositionService],
})
export class PositionModule {}
