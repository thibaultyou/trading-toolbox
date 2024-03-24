import { Module } from '@nestjs/common';

import { AccountModule } from '../account/account.module';
import { ExchangeModule } from '../exchange/exchange.module';
import { CoreService } from './core.service';

@Module({
  imports: [AccountModule, ExchangeModule],
  providers: [CoreService],
})
export class CoreModule {}
