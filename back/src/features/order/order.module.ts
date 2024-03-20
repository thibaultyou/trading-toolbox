import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { OrderController } from './order.controller';
import { OrderService } from './order.service';

@Module({
  imports: [EventEmitterModule],
  providers: [OrderService],
  controllers: [OrderController],
  exports: [OrderService],
})
export class OrderModule {}
