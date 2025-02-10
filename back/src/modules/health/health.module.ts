import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { BitgetHealthIndicator } from './indicators/bitget.health.indicator';
import { BybitHealthIndicator } from './indicators/bybit.health.indicator';

@Module({
  controllers: [HealthController],
  imports: [TerminusModule],
  providers: [BybitHealthIndicator, BitgetHealthIndicator]
})
export class HealthModule {}
