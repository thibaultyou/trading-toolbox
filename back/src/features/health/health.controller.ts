import { Controller, Get } from '@nestjs/common';
import { ApiOperation, ApiResponse, ApiTags } from '@nestjs/swagger';
import {
  HealthCheck,
  HealthCheckService,
  TypeOrmHealthIndicator,
} from '@nestjs/terminus';

import { BybitHealthIndicator } from './bybit.health.indicator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private database: TypeOrmHealthIndicator,
    private bybitHealthIndicator: BybitHealthIndicator,
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Get services health status',
  })
  check() {
    return this.health.check([
      () => this.database.pingCheck('database', { timeout: 300 }),
      async () => this.bybitHealthIndicator.isHealthy('bybit'),
    ]);
  }
}
