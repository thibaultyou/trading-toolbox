import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { Interval } from '@nestjs/schedule';
import { Order } from 'ccxt';

import { AccountNotFoundException } from '@account/exceptions/account.exceptions';
import { IAccountSynchronizer } from '@common/interfaces/account-synchronizer.interface';
import { IAccountTracker } from '@common/interfaces/account-tracker.interface';
import { ConfigService } from '@config';
import { Timers } from '@config';
import { ExchangeService } from '@exchange/exchange.service';
import { OrderSide } from '@order/types/order-side.enum';

import { PositionClosedEvent } from './events/position-closed.event';
import { PositionsUpdatedEvent } from './events/positions-updated.event';
import { PositionNotFoundException, PositionsUpdateAggregatedException } from './exceptions/position.exceptions';
import { PositionMapperService } from './services/position-mapper.service';
import { IPosition } from './types/position.interface';

@Injectable()
export class PositionService implements IAccountTracker, IAccountSynchronizer<IPosition[]> {
  private readonly logger = new Logger(PositionService.name);
  private readonly positions: Map<string, IPosition[]> = new Map();

  constructor(
    private readonly eventEmitter: EventEmitter2,
    private readonly exchangeService: ExchangeService,
    private readonly positionMapper: PositionMapperService,
    private readonly configService: ConfigService
  ) {}

  @Interval(Timers.POSITIONS_CACHE_COOLDOWN)
  sync(): void {
    this.syncAllAccounts();
  }

  async startTrackingAccount(accountId: string): Promise<void> {
    this.logger.debug(`startTrackingAccount() - start | accountId=${accountId}`);

    if (this.positions.has(accountId)) {
      this.logger.warn(`startTrackingAccount() - skip | accountId=${accountId}, reason=Already tracked`);
      return;
    }

    await this.syncAccount(accountId);
    this.logger.log(`startTrackingAccount() - success | accountId=${accountId}, tracking=started`);
  }

  stopTrackingAccount(accountId: string): void {
    this.logger.debug(`stopTrackingAccount() - start | accountId=${accountId}`);
    const deleted = this.positions.delete(accountId);

    if (deleted) {
      this.logger.log(`stopTrackingAccount() - success | accountId=${accountId}, tracking=stopped`);
    } else {
      this.logger.warn(`stopTrackingAccount() - skip | accountId=${accountId}, reason=Not tracked`);
    }
  }

  getPositions(accountId: string, marketId?: string, side?: OrderSide): IPosition[] {
    this.logger.debug(
      `getPositions() - start | accountId=${accountId}${marketId ? `, marketId=${marketId}` : ''}${
        side ? `, side=${side}` : ''
      }`
    );

    if (!this.positions.has(accountId)) {
      this.logger.warn(`getPositions() - not found | accountId=${accountId}, reason=Positions not tracked`);
      throw new AccountNotFoundException(accountId);
    }

    let positions = this.positions.get(accountId) ?? [];

    if (marketId) {
      positions = positions.filter((position) => position.marketId === marketId.toUpperCase());
    }

    if (side) {
      positions = positions.filter((position) => position.side.toLowerCase() === side.toLowerCase());
    }

    this.logger.log(`getPositions() - success | accountId=${accountId}, count=${positions.length}`);
    return positions;
  }

  async closePosition(accountId: string, marketId: string, side: OrderSide): Promise<Order> {
    this.logger.debug(`closePosition() - start | accountId=${accountId}, marketId=${marketId}, side=${side}`);
    const position = this.getPositions(accountId).find(
      (p) => p.marketId === marketId.toUpperCase() && p.side.toLowerCase() === side.toLowerCase()
    );

    if (!position) {
      this.logger.warn(`closePosition() - not found | accountId=${accountId}, marketId=${marketId}, side=${side}`);
      throw new PositionNotFoundException(accountId, marketId);
    }

    try {
      const order = await this.exchangeService.closePosition(accountId, marketId, side, position.amount);
      this.logger.log(
        `closePosition() - success | accountId=${accountId}, marketId=${marketId}, side=${side}, orderId=${order.id}`
      );

      this.eventEmitter.emit(this.configService.events.Position.CLOSED, new PositionClosedEvent(accountId, order));
      return order;
    } catch (error) {
      this.logger.error(
        `closePosition() - error | accountId=${accountId}, marketId=${marketId}, side=${side}, msg=${error.message}`,
        error.stack
      );
      throw error;
    }
  }

  async syncAccount(accountId: string): Promise<IPosition[]> {
    this.logger.debug(`syncAccount() - start | accountId=${accountId}`);

    try {
      const externalPositions = await this.exchangeService.getOpenPositions(accountId);
      const newPositions = externalPositions.map((pos) => this.positionMapper.fromExternal(pos));
      this.positions.set(accountId, newPositions);
      this.logger.log(`syncAccount() - success | accountId=${accountId}, count=${newPositions.length}`);
      this.eventEmitter.emit(
        this.configService.events.Data.POSITION_UPDATED,
        new PositionsUpdatedEvent(accountId, newPositions)
      );
      return newPositions;
    } catch (error) {
      this.logger.error(`syncAccount() - error | accountId=${accountId}, msg=${error.message}`, error.stack);
      throw error;
    }
  }

  async syncAllAccounts(): Promise<void> {
    this.logger.debug('syncAllAccounts() - start');
    const accountIds = Array.from(this.positions.keys());
    const errors: Array<{ accountId: string; error: Error }> = [];
    const tasks = accountIds.map((accountId) =>
      this.syncAccount(accountId).catch((err) => {
        errors.push({ accountId, error: err });
      })
    );
    await Promise.all(tasks);

    if (errors.length > 0) {
      const aggregatedError = new PositionsUpdateAggregatedException(errors);
      this.logger.error(`syncAllAccounts() - error | msg=${aggregatedError.message}`, aggregatedError.stack);
    }

    this.logger.debug('syncAllAccounts() - complete');
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
