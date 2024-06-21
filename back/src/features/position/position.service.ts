import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order, Position } from 'ccxt';

import { IAccountTracker } from '../../common/types/account-tracker.interface';
import { IDataRefresher } from '../../common/types/data-refresher.interface';
import { Events, Timers } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { ExchangeService } from '../exchange/exchange.service';
import { OrderSide } from '../order/order.types';
import { PositionsClosedEvent } from './events/position-closed.event';
import { PositionsUpdatedEvent } from './events/positions-updated.event';
import { PositionNotFoundException, PositionsUpdateAggregatedException } from './exceptions/position.exceptions';

// TODO improve logging, error handling, custom exceptions

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
      this.logger.log(`Tracking Initiated - AccountID: ${accountId}`);
      await this.refreshOne(accountId);
    } else {
      this.logger.warn(`Tracking Skipped - AccountID: ${accountId}, Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    if (this.positions.delete(accountId)) {
      this.logger.log(`Tracking Stopped - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Tracking Removal Attempt Failed - AccountID: ${accountId}, Reason: Not tracked`);
    }
  }

  getAccountOpenPositions(accountId: string, marketId?: string, side?: OrderSide): Position[] {
    this.logger.log(
      `Open Positions - Fetch Initiated - AccountID: ${accountId}${marketId ? `, MarketID: ${marketId}` : ''}${side ? `, Side: ${side}` : ''}`
    );

    if (!this.positions.has(accountId)) {
      this.logger.error(
        `Open Positions - Fetch Failed - AccountID: ${accountId}${marketId ? `, MarketID: ${marketId}` : ''}${side ? `, Side: ${side}` : ''}, Reason: Account not found`
      );

      throw new AccountNotFoundException(accountId);
    }

    let positions = this.positions.get(accountId);

    if (marketId) {
      positions = positions.filter((position) => position.info.symbol === marketId.toUpperCase());
    }

    if (side) {
      positions = positions.filter((position) => position.info.side.toLowerCase() === side.toLowerCase());
    }

    return positions;
  }

  async closePosition(accountId: string, marketId: string, side: OrderSide): Promise<Order> {
    this.logger.log(
      `Open Position - Close Initiated - AccountID: ${accountId}, MarketID: ${marketId}, Side: ${side}`,
      this.positions.get(accountId)
    );

    const position = this.getAccountOpenPositions(accountId).find(
      (p) => p.info.symbol === marketId.toUpperCase() && p.info.side.toLowerCase() === side.toLowerCase()
    );

    if (!position) {
      this.logger.error(
        `Open Position - Close Failed - AccountID: ${accountId}, MarketID: ${marketId}, Side: ${side}, Reason: Position not found`
      );
      throw new PositionNotFoundException(accountId, marketId);
    }

    try {
      // FIXME remove
      this.logger.error(position);
      //
      const order = await this.exchangeService.closePosition(accountId, marketId, side, position.contracts);

      this.eventEmitter.emit(Events.POSITION_CLOSED, new PositionsClosedEvent(accountId, order));
      this.logger.log(`Open Position - Close Succeeded - AccountID: ${accountId}, Order: ${JSON.stringify(order)}`);

      return order;
    } catch (error) {
      this.logger.error(
        `Open Position - Close Failed - AccountID: ${accountId}, MarketID: ${marketId}, Side: ${side}, Error: ${error.message}`
      );
      throw error;
      // FIXME
      // throw new ClosePositionException(accountId, positionId, error.message);
    }
  }

  async refreshOne(accountId: string): Promise<Position[]> {
    this.logger.log(`Open Positions - Refresh Initiated - AccountID: ${accountId}`);

    try {
      const positions = await this.exchangeService.getOpenPositions(accountId);

      this.positions.set(accountId, positions);
      this.eventEmitter.emit(Events.POSITIONS_UPDATED, new PositionsUpdatedEvent(accountId, positions));
      this.logger.log(`Open Positions - Updated - AccountID: ${accountId}, Count: ${positions.length}`);

      return positions;
    } catch (error) {
      this.logger.error(
        `Open Positions - Update Failed - AccountID: ${accountId}, Error: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async refreshAll(): Promise<void> {
    this.logger.log(`All Open Positions - Refresh Initiated`);
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

      this.logger.error(`Multiple Updates Failed - Errors: ${aggregatedError.message}`, aggregatedError.stack);
      // NOTE Avoid interrupting the loop by not throwing an exception
    }
  }
}
