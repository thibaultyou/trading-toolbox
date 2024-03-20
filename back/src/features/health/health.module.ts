import { Module } from '@nestjs/common';
import { TerminusModule } from '@nestjs/terminus';

import { BybitHealthIndicator } from './bybit.health.indicator';
import { HealthController } from './health.controller';

@Module({
  imports: [TerminusModule],
  controllers: [HealthController],
  providers: [BybitHealthIndicator],
})
export class HealthModule {}
