import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { ExchangeService } from './exchange.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
@Module({
  imports: [EventEmitterModule, AccountModule],
  providers: [ExchangeService],
  exports: [ExchangeService],
})
export class ExchangeModule {}
