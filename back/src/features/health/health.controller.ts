import { Controller, Get, HttpStatus, Res } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Response } from 'express';

import { BybitHealthIndicator } from './indicators/bybit.health.indicator';

@ApiTags('Health')
@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private database: TypeOrmHealthIndicator,
    private bybitHealthIndicator: BybitHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({
    summary: 'Get services health status'
  })
  async check(@Res() response: Response) {
    try {
      const result = await this.health.check([
        () => this.database.pingCheck('database', { timeout: 300 }),
        async () => this.bybitHealthIndicator.isHealthy('bybit')
      ]);
      const statusCode = result.status === 'error' ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK;
      response.status(statusCode).json(result);
    } catch (error) {
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: 'error', error: error.message });
    }
  }
}
