import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { ExchangeService } from './exchange.service';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { AccountCreatedHandler } from './handlers/account-created.event-handler';

@Module({
  imports: [EventEmitterModule, AccountModule],
  providers: [ExchangeService, AccountCreatedHandler],
  exports: [ExchangeService],
})
export class ExchangeModule {}
