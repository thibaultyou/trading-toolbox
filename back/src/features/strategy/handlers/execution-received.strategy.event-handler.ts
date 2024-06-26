import { Injectable, Logger } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';

import { EventHandlersContext, Events } from '../../../config';
import { ExecutionDataReceivedEvent } from '../../core/events/execution-data-received.event';
import { StrategyService } from '../strategy.service';

@Injectable()
export class StrategyModuleExecutionReceivedEventHandler {
  private logger = new Logger(EventHandlersContext.StrategyModuleEventHandler);

  constructor(private strategyService: StrategyService) {}

  @OnEvent(Events.EXECUTION_DATA_RECEIVED)
  async handle(event: ExecutionDataReceivedEvent) {
    const actionContext = `${Events.EXECUTION_DATA_RECEIVED} | AccountID: ${event.accountId}`;

    try {
      for (const executionData of event.data) {
        await this.strategyService.processOrderExecutionData(event.accountId, executionData);
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
