import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Order } from 'ccxt';

import { IAccountTracker } from '../../common/types/account-tracker.interface';
import { Events, Timers } from '../../config';
import { AccountNotFoundException } from '../account/exceptions/account.exceptions';
import { ExchangeService } from '../exchange/exchange.service';
import { OrderSide } from '../order/types/order-side.enum';
import { PositionClosedEvent } from './events/position-closed.event';
import { PositionsUpdatedEvent } from './events/positions-updated.event';
import { PositionNotFoundException, PositionsUpdateAggregatedException } from './exceptions/position.exceptions';
import { IPosition } from './position.interface';
import { fromPositionToInternalPosition } from './position.utils';

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
    setInterval(() => {
      this.refreshAll();
    }, Timers.POSITIONS_CACHE_COOLDOWN);
  }

  async startTrackingAccount(accountId: string) {
    if (!this.positions.has(accountId)) {
      this.logger.log(`Tracking Initiated - AccountID: ${accountId}`);
      await this.fetchPositions(accountId);
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

  getPositions(accountId: string, marketId?: string, side?: OrderSide): IPosition[] {
    this.logger.log(
      `Positions - Fetch Initiated - AccountID: ${accountId}${marketId ? `, MarketID: ${marketId}` : ''}${side ? `, Side: ${side}` : ''}`
    );

    if (!this.positions.has(accountId)) {
      this.logger.error(
        `Positions - Fetch Failed - AccountID: ${accountId}${marketId ? `, MarketID: ${marketId}` : ''}${side ? `, Side: ${side}` : ''}, Reason: Account not found`
      );
      throw new AccountNotFoundException(accountId);
    }

    let positions = this.positions.get(accountId);

    if (marketId) {
      positions = positions.filter((position) => position.marketId === marketId.toUpperCase());
    }

    if (side) {
      positions = positions.filter((position) => position.side.toLowerCase() === side.toLowerCase());
    }
    return positions;
  }

  async closePosition(accountId: string, marketId: string, side: OrderSide): Promise<Order> {
    this.logger.log(
      `Position - Close Initiated - AccountID: ${accountId}, MarketID: ${marketId}, Side: ${side}`,
      this.positions.get(accountId)
    );

    const position = this.getPositions(accountId).find(
      (p) => p.marketId === marketId.toUpperCase() && p.side.toLowerCase() === side.toLowerCase()
    );

    if (!position) {
      this.logger.error(
        `Position - Close Failed - AccountID: ${accountId}, MarketID: ${marketId}, Side: ${side}, Reason: Position not found`
      );
      throw new PositionNotFoundException(accountId, marketId);
    }

    try {
      const order = await this.exchangeService.closePosition(accountId, marketId, side, position.amount);
      this.eventEmitter.emit(Events.POSITION_CLOSED, new PositionClosedEvent(accountId, order));
      this.logger.log(`Position - Close Succeeded - AccountID: ${accountId}, Order: ${JSON.stringify(order)}`);
      return order;
    } catch (error) {
      this.logger.error(
        `Position - Close Failed - AccountID: ${accountId}, MarketID: ${marketId}, Side: ${side}, Error: ${error.message}`
      );
      throw error;
      // FIXME
      // throw new ClosePositionException(accountId, positionId, error.message);
    }
  }

  async fetchPositions(accountId: string): Promise<IPosition[]> {
    this.logger.log(`Positions - Refresh Initiated - AccountID: ${accountId}`);

    try {
      const positions = await this.exchangeService.getOpenPositions(accountId);
      const newPositions = positions.map((position) => fromPositionToInternalPosition(position));
      this.positions.set(accountId, newPositions);
      this.eventEmitter.emit(Events.POSITIONS_UPDATED, new PositionsUpdatedEvent(accountId, newPositions));
      this.logger.log(`Positions - Updated - AccountID: ${accountId}, Count: ${positions.length}`);
      return newPositions;
    } catch (error) {
      this.logger.error(`Positions - Update Failed - AccountID: ${accountId}, Error: ${error.message}`, error.stack);
      throw error;
    }
  }

  async refreshAll() {
    this.logger.debug(`All Open Positions - Refresh Initiated`);
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
      this.logger.error(`Multiple Updates Failed - Errors: ${aggregatedError.message}`, aggregatedError.stack);
      // NOTE Avoid interrupting the loop by not throwing an exception
    }
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
