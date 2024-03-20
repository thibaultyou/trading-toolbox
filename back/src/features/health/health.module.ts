import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { HealthController } from './health.controller';
import { BybitHealthIndicator } from './indicators/bybit.health.indicator';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [BybitHealthIndicator],
})
export class HealthModule {}
