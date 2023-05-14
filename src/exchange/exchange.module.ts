import { Module } from '@nestjs/common';
import { AccountModule } from '../account/account.module';
import { ExchangeService } from './exchange.service';

@Module({
  imports: [AccountModule],
  providers: [ExchangeService],
  exports: [ExchangeService],
})
export class ExchangeModule {}
