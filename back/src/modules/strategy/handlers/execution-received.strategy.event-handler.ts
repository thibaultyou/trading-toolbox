import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { ConfigService, Events } from '@config';
import { ExecutionDataReceivedEvent } from '@exchange/events/execution-data-received.event';

import { StrategyService } from '../strategy.service';

@Injectable()
export class StrategyModuleExecutionReceivedEventHandler {
  private readonly logger = new Logger(this.configService.handlers.StrategyModule);

  constructor(
    private readonly strategyService: StrategyService,
    private readonly configService: ConfigService
  ) {}

  @OnEvent(Events.Data.EXECUTION_RECEIVED)
  async handle(event: ExecutionDataReceivedEvent) {
    const accountId = event.accountId;
    const actionContext = `${Events.Data.EXECUTION_RECEIVED} | accountId=${accountId}`;
    this.logger.debug(`handle() - start | ${actionContext}`);

    try {
      for (const executionData of event.data) {
        await this.strategyService.processOrderExecutionData(executionData);
      }
      this.logger.log(`handle() - success | ${actionContext}, count=${event.data.length}`);
    } catch (error) {
      this.logger.error(`handle() - error | ${actionContext}, msg=${error.message}`, error.stack);
    }
  }
}
