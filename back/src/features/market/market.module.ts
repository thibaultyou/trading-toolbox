import { Module } from '@nestjs/common';

import { AccountModule } from '../account/account.module';
import { MarketController } from './market.controller';
import { MarketService } from './market.service';

@Module({
  imports: [AccountModule],
  providers: [MarketService],
  controllers: [MarketController],
  exports: [MarketService],
})
export class MarketModule {}
