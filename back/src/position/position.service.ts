import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AccountService } from '../account/account.service';
import { Events, Timers } from '../app.constants';
import { ExchangeService } from '../exchange/exchange.service';

import { PositionUpdatedEvent } from './events/position-updated.event';
import {
  PositionComparisonException,
  PositionUpdateException,
} from './exceptions/position.exceptions';
import { Position } from './position.types';
@Injectable()
export class PositionService implements OnModuleInit {
  private logger = new Logger(PositionService.name);
  private positions: Record<string, Position[]> = {};

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private accountService: AccountService,
  ) { }

  async onModuleInit() {
    try {
      await this.updatePositions();
    } catch (error) {
      this.logger.error('Error during initial position update', error.stack);
    }

    setInterval(async () => {
      try {
        await this.updatePositions();
      } catch (error) {
        this.logger.error('Error during position update in interval', error.stack);
      }
    }, Timers.POSITION_UPDATE_COOLDOWN);
  }

  async getPositions(accountName: string): Promise<Position[]> {
    return this.positions[accountName] || [];
  }

  private async updatePositions() {
    try {
      const accounts = await this.accountService.findAll();
      for (const account of accounts) {
        const newPositions = await this.exchangeService.getOpenPositions(
          account.name,
        );
        if (this.hasPositionsChanged(account.name, newPositions)) {
          this.positions[account.name] = newPositions;
          this.logger.debug(
            `Updating positions for ${account.name}: ${JSON.stringify(
              newPositions,
            )}`,
          );
          this.eventEmitter.emit(
            Events.POSITION_UPDATED,
            new PositionUpdatedEvent(account.name, newPositions),
          );
        }
      }
    } catch (error) {
      this.logger.error('Error during updating positions', error.stack);
      // throw new PositionUpdateException(error);
    }
  }

  private hasPositionsChanged(
    accountName: string,
    newPositions: Position[],
  ): boolean {
    try {
      const currentPositions = this.positions[accountName] || [];
      return JSON.stringify(newPositions) !== JSON.stringify(currentPositions);
    } catch (error) {
      this.logger.error('Error during positions comparison', error.stack);
      throw new PositionComparisonException(error);
    }
  }
}
