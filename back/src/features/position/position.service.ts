import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, Position } from 'ccxt';

import { IAccountTracker } from '../../common/interfaces/account-tracker.interface';
import { IDataRefresher } from '../../common/interfaces/data-refresher.interface';
import { Events, Timers } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { ClosePositionException } from '../exchange/exceptions/exchange.exceptions';
import { ExchangeService } from '../exchange/exchange.service';
import { PositionsClosedEvent } from './events/position-closed.event';
import { PositionsUpdatedEvent } from './events/positions-updated.event';
import { PositionNotFoundException, PositionsUpdateAggregatedException } from './exceptions/position.exceptions';

@Injectable()
export class PositionService implements OnModuleInit, IAccountTracker, IDataRefresher<Position[]> {
  private logger = new Logger(PositionService.name);
  private positions: Map<string, Position[]> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService
  ) {}

  async onModuleInit() {
    setInterval(() => {
      this.refreshAll();
    }, Timers.POSITIONS_CACHE_COOLDOWN);
  }

  async startTrackingAccount(accountId: string): Promise<void> {
    if (!this.positions.has(accountId)) {
      this.logger.log(`Position - Tracking Initiated - AccountID: ${accountId}`);
      await this.refreshOne(accountId);
    } else {
      this.logger.warn(`Position - Tracking Skipped - AccountID: ${accountId}, Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    if (this.positions.delete(accountId)) {
      this.logger.log(`Position - Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Position - Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  getAccountPositions(accountId: string): Position[] {
    this.logger.log(`Position - Fetch Initiated - AccountID: ${accountId}`);

    if (!this.positions.has(accountId)) {
      this.logger.error(`Position - Fetch Failed - AccountID: ${accountId}, Reason: Account not found`);

      throw new AccountNotFoundException(accountId);
    }

    return this.positions.get(accountId);
  }

  async closePositionById(accountId: string, positionId: string): Promise<Order> {
    this.logger.log(`Position - Close Initiated - AccountID: ${accountId}, PositionID: ${positionId}`);

    const position = this.getAccountPositions(accountId).find((p) => p.id === positionId);

    if (!position) {
      this.logger.error(
        `Position - Close Failed - AccountID: ${accountId}, PositionID: ${positionId}, Reason: Position not found`
      );
      throw new PositionNotFoundException(accountId, positionId);
    }

    try {
      const order = await this.exchangeService.closePosition(accountId, position);

      this.eventEmitter.emit(Events.POSITION_CLOSED, new PositionsClosedEvent(accountId, order));
      this.logger.log(
        `Position - Close Succeeded - AccountID: ${accountId}, PositionID: ${positionId}, Order: ${JSON.stringify(order)}`
      );

      return order;
    } catch (error) {
      this.logger.error(
        `Position - Close Failed - AccountID: ${accountId}, PositionID: ${positionId}, Error: ${error.message}`
      );
      throw new ClosePositionException(accountId, positionId, error.message);
    }
  }

  async refreshOne(accountId: string): Promise<Position[]> {
    this.logger.debug(`Position - Refresh Initiated - AccountID: ${accountId}`);

    try {
      const positions = await this.exchangeService.getOpenPositions(accountId);

      this.positions.set(accountId, positions);
      this.eventEmitter.emit(Events.POSITIONS_UPDATED, new PositionsUpdatedEvent(accountId, positions));
      this.logger.log(`Position - Update Success - AccountID: ${accountId}, Count: ${positions.length}`);

      return positions;
    } catch (error) {
      this.logger.error(`Position - Update Failed - AccountID: ${accountId}, Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshAll(): Promise<void> {
    this.logger.debug(`Position - Refresh All Initiated`);
    const accountIds = Array.from(this.positions.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];

    const positionsPromises = accountIds.map((accountId) =>
      this.refreshOne(accountId).catch((error) => {
        errors.push({ accountId, error });
      })
    );

    await Promise.all(positionsPromises);

    if (errors.length > 0) {
      const aggregatedError = new PositionsUpdateAggregatedException(errors);

      this.logger.error(
        `Position - Multiple Updates Failed - Errors: ${aggregatedError.message}`,
        aggregatedError.stack
      );
      // Avoid interrupting the loop by not throwing an exception
    }
  }
}
