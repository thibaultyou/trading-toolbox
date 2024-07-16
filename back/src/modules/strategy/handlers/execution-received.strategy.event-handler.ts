import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '@config';
import { ExecutionDataReceivedEvent } from '@exchange/events/execution-data-received.event';

import { StrategyService } from '../strategy.service';

@Injectable()
export class StrategyModuleExecutionReceivedEventHandler {
  private logger = new Logger(EventHandlersContext.StrategyModule);

  constructor(private strategyService: StrategyService) {}

  @OnEvent(Events.Data.EXECUTION_RECEIVED)
  async handle(event: ExecutionDataReceivedEvent) {
    const actionContext = `${Events.Data.EXECUTION_RECEIVED} | AccountID: ${event.accountId}`;

    try {
      for (const executionData of event.data) {
        await this.strategyService.processOrderExecutionData(executionData);
      }
      this.logger.log(actionContext);
    } catch (error) {
      this.logger.error(
        `${actionContext} - Failed to process order execution data - Error: ${error.message}`,
        error.stack
      );
    }
  }
}
