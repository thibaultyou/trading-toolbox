import { Module } from '@nestjs/common';

import { AccountModule } from '../account/account.module';

import { MarketController } from './market.controller';

@Module({
  imports: [AccountModule],
  controllers: [MarketController],
})
export class MarketModule {}
