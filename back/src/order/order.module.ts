import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AccountModule } from '../account/account.module';
import { OrderService } from './order.service';

@Module({
  imports: [EventEmitterModule, AccountModule],
  providers: [OrderService],
  exports: [OrderService],
})
export class OrderModule {}
