import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Position } from 'ccxt';

import { Events, Timers } from '../../config';
import { ExchangeService } from '../../features/exchange/exchange.service';
import { ITrackableService } from '../common/interfaces/trackable.service.interface';
import { PositionsUpdatedEvent } from './events/positions-updated.event';
import { PositionsUpdateAggregatedException } from './exceptions/position.exceptions';

@Injectable()
export class PositionService
  implements OnModuleInit, ITrackableService<Position[]>
{
  private logger = new Logger(PositionService.name);
  private positions: Map<string, Position[]> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
  ) {}

  async onModuleInit() {
    setInterval(() => {
      this.refreshAll();
    }, Timers.POSITIONS_CACHE_COOLDOWN);
  }

  addAccount(accountId: string) {
    if (!this.positions.has(accountId)) {
      this.logger.log(
        `Position - Tracking Initiated - AccountID: ${accountId}`,
      );
      this.refreshOne(accountId);
    } else {
      this.logger.warn(
        `Position - Tracking Skipped - AccountID: ${accountId}, Reason: Already tracked`,
      );
    }
  }

  removeAccount(accountId: string) {
    if (this.positions.delete(accountId)) {
      this.logger.log(`Position - Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(
        `Position - Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`,
      );
    }
  }

  async refreshOne(accountId: string): Promise<Position[]> {
    this.logger.debug(`Position - Refresh Initiated - AccountID: ${accountId}`);

    try {
      const positions = await this.exchangeService.getOpenPositions(accountId);

      this.positions.set(accountId, positions);
      this.eventEmitter.emit(
        Events.POSITIONS_UPDATED,
        new PositionsUpdatedEvent(accountId, positions),
      );
      this.logger.log(
        `Position - Update Success - AccountID: ${accountId}, Count: ${positions.length}`,
      );
      this.logger.debug(
        `Position - Open Positions - AccountID: ${accountId}, Positions: ${JSON.stringify(positions)}`,
      );

      return positions;
    } catch (error) {
      this.logger.error(
        `Position - Update Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack,
      );
      throw error;
    }
  }

  async refreshAll(): Promise<void> {
    this.logger.debug(`Positions - Refresh Initiated`);
    const accountIds = Array.from(this.positions.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];

    const positionsPromises = accountIds.map((accountId) =>
      this.refreshOne(accountId).catch((error) => {
        errors.push({ accountId, error });
      }),
    );

    await Promise.all(positionsPromises);

    if (errors.length > 0) {
      const aggregatedError = new PositionsUpdateAggregatedException(errors);

      this.logger.error(
        `Positions - Multiple Updates Failed - Errors: ${aggregatedError.message}`,
        aggregatedError.stack,
      );
      throw aggregatedError;
    }
  }
}
