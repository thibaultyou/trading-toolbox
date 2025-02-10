import { Controller, Get, HttpStatus, Res, Logger } from '@nestjs/common';
import { ApiOperation, ApiTags } from '@nestjs/swagger';
import { HealthCheck, HealthCheckService, TypeOrmHealthIndicator } from '@nestjs/terminus';
import { Response } from 'express';

import { Urls } from '@config';

import { BitgetHealthIndicator } from './indicators/bitget.health.indicator';
import { BybitHealthIndicator } from './indicators/bybit.health.indicator';

@ApiTags('Health')
@Controller(Urls.HEALTH)
export class HealthController {
  private readonly logger = new Logger(HealthController.name);

  constructor(
    private health: HealthCheckService,
    private database: TypeOrmHealthIndicator,
    private bybitHealthIndicator: BybitHealthIndicator,
    private bitgetHealthIndicator: BitgetHealthIndicator
  ) {}

  @Get()
  @HealthCheck()
  @ApiOperation({ summary: 'Get services health status' })
  async check(@Res() response: Response) {
    try {
      const result = await this.health.check([
        () => this.database.pingCheck('database', { timeout: 300 }),
        async () => this.bybitHealthIndicator.isHealthy('bybit'),
        async () => this.bitgetHealthIndicator.isHealthy('bitget')
      ]);
      // NOTE Remove the redundant properties if no extra is defined
      delete result.details;

      if (Object.keys(result.error).length === 0) {
        delete result.error; // NOTE If empty, remove the “error” field entirely
      }

      const statusCode = result.status === 'error' ? HttpStatus.SERVICE_UNAVAILABLE : HttpStatus.OK;
      response.status(statusCode).json(result);
    } catch (error) {
      this.logger.error(`check() - error | path=/health, msg=${error.message}`, error.stack);
      response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({ status: 'error', error: error.message });
    }
  }
}
