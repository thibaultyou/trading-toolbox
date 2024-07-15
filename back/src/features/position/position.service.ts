import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from 'ccxt';

import { AccountNotFoundException } from '@account/exceptions/account.exceptions';
import { IAccountTracker } from '@common/types/account-tracker.interface';
import { Events } from '@config/events.config';
import { Timers } from '@config/timers.config';
import { ExchangeService } from '@exchange/exchange.service';
import { OrderSide } from '@order/types/order-side.enum';

import { PositionClosedEvent } from './events/position-closed.event';
import { PositionsUpdatedEvent } from './events/positions-updated.event';
import { PositionNotFoundException, PositionsUpdateAggregatedException } from './exceptions/position.exceptions';
import { fromPositionToInternalPosition } from './position.utils';
import { IPosition } from './types/position.interface';

// TODO improve logging, error handling, custom exceptions

@Injectable()
export class PositionService implements OnModuleInit, IAccountTracker {
  private logger = new Logger(PositionService.name);
  private positions: Map<string, IPosition[]> = new Map();

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService
  ) {}

  async onModuleInit() {
    this.logger.debug('Initializing module');
    setInterval(() => {
      this.refreshAll();
    }, Timers.POSITIONS_CACHE_COOLDOWN);
    this.logger.log('Module initialized successfully');
  }

  async startTrackingAccount(accountId: string) {
    this.logger.debug(`Starting account tracking - AccountID: ${accountId}`);

    if (!this.positions.has(accountId)) {
      await this.fetchPositions(accountId);
      this.logger.log(`Started tracking account - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Account tracking skipped - AccountID: ${accountId} - Reason: Already tracked`);
    }
  }

  stopTrackingAccount(accountId: string) {
    this.logger.debug(`Stopping account tracking - AccountID: ${accountId}`);

    if (this.positions.delete(accountId)) {
      this.logger.log(`Stopped tracking account - AccountID: ${accountId}`);
    } else {
      this.logger.warn(`Account tracking removal failed - AccountID: ${accountId} - Reason: Not tracked`);
    }
  }

  getPositions(accountId: string, marketId?: string, side?: OrderSide): IPosition[] {
    this.logger.debug(
      `Fetching positions - AccountID: ${accountId}${marketId ? ` - MarketID: ${marketId}` : ''}${side ? ` - Side: ${side}` : ''}`
    );

    if (!this.positions.has(accountId)) {
      this.logger.warn(`Positions not found - AccountID: ${accountId}`);
      throw new AccountNotFoundException(accountId);
    }

    let positions = this.positions.get(accountId);

    if (marketId) {
      positions = positions.filter((position) => position.marketId === marketId.toUpperCase());
    }

    if (side) {
      positions = positions.filter((position) => position.side.toLowerCase() === side.toLowerCase());
    }

    this.logger.debug(`Fetched positions - AccountID: ${accountId} - Count: ${positions.length}`);
    return positions;
  }

  async closePosition(accountId: string, marketId: string, side: OrderSide): Promise<Order> {
    this.logger.debug(`Closing position - AccountID: ${accountId} - MarketID: ${marketId} - Side: ${side}`);

    const position = this.getPositions(accountId).find(
      (p) => p.marketId === marketId.toUpperCase() && p.side.toLowerCase() === side.toLowerCase()
    );

    if (!position) {
      this.logger.warn(`Position not found - AccountID: ${accountId} - MarketID: ${marketId} - Side: ${side}`);
      throw new PositionNotFoundException(accountId, marketId);
    }

    try {
      const order = await this.exchangeService.closePosition(accountId, marketId, side, position.amount);
      this.eventEmitter.emit(Events.POSITION_CLOSED, new PositionClosedEvent(accountId, order));
      this.logger.log(
        `Closed position - AccountID: ${accountId} - MarketID: ${marketId} - Side: ${side} - OrderID: ${order.id}`
      );
      return order;
    } catch (error) {
      this.logger.error(
        `Position closing failed - AccountID: ${accountId} - MarketID: ${marketId} - Side: ${side} - Error: ${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async fetchPositions(accountId: string): Promise<IPosition[]> {
    this.logger.debug(`Fetching positions - AccountID: ${accountId}`);

    try {
      const positions = await this.exchangeService.getOpenPositions(accountId);
      const newPositions = positions.map((position) => fromPositionToInternalPosition(position));
      this.positions.set(accountId, newPositions);
      this.eventEmitter.emit(Events.POSITIONS_UPDATED, new PositionsUpdatedEvent(accountId, newPositions));
      this.logger.log(`Fetched positions - AccountID: ${accountId} - Count: ${newPositions.length}`);
      return newPositions;
    } catch (error) {
      this.logger.error(`Positions fetch failed - AccountID: ${accountId} - Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshAll() {
    this.logger.debug('Starting refresh of all positions');
    const accountIds = Array.from(this.positions.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];
    const positionsPromises = accountIds.map((accountId) =>
      this.fetchPositions(accountId).catch((error) => {
        errors.push({ accountId, error });
      })
    );
    await Promise.all(positionsPromises);

    if (errors.length > 0) {
      const aggregatedError = new PositionsUpdateAggregatedException(errors);
      this.logger.error(`Multiple position updates failed - Errors: ${aggregatedError.message}`, aggregatedError.stack);
    }

    this.logger.debug(`Completed refresh of all positions`);
  }
}

// processPositionData(accountId: string, positionData: IPositionData) {
//   this.logger.log(`Position Data - Update Initiated - AccountID: ${accountId}`);
//   const existingPositions = this.positions.get(accountId);

//   if (!existingPositions) {
//     this.logger.error(`Position Data - Update Failed - AccountID: ${accountId}, Reason: Account not found`);
//     throw new AccountNotFoundException(accountId);
//   }

//   const updatedPosition = fromPositionDataToPosition(positionData);
//   const index = existingPositions.findIndex(p => p.marketId === updatedPosition.marketId && p.side === updatedPosition.side);

//   if (index !== -1) {
//     existingPositions[index] = updatedPosition;
//   } else {
//     existingPositions.push(updatedPosition);
//   }

//   this.positions.set(accountId, existingPositions);
//   this.eventEmitter.emit(Events.POSITION_UPDATED, new PositionUpdatedEvent(accountId, updatedPosition));
//   this.logger.log(`Position Data - Updated - AccountID: ${accountId}`);
// }
