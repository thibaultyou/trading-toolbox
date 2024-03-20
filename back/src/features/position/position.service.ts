import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Events, Timers } from '../../config';
import { ExchangeService } from '../../features/exchange/exchange.service';
import { delay } from '../../utils/delay.util';

import { PositionUpdatedEvent } from './events/position-updated.event';
import { PositionComparisonException } from './exceptions/position.exceptions';
import { Position } from './position.types';

@Injectable()
export class PositionService implements OnModuleInit {
  private logger = new Logger(PositionService.name);
  private positions: Record<string, Position[]> = {};

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
  ) {}

  async onModuleInit() {
    this.updatePositions();
    setInterval(() => {
      this.updatePositions();
    }, Timers.POSITION_UPDATE_COOLDOWN);
  }

  async getPositions(accountName: string): Promise<Position[]> {
    return this.positions[accountName] || [];
  }

  private async updatePositions() {
    const initializedAccountNames =
      this.exchangeService.getInitializedAccountNames();
    try {
      for (const accountName of initializedAccountNames) {
        const newPositions = await this.exchangeService.getOpenPositions(
          accountName,
        );
        if (this.hasPositionsChanged(accountName, newPositions)) {
          this.positions[accountName] = newPositions;
          this.logger.debug(
            `Updating positions for ${accountName} account: ${JSON.stringify(
              newPositions,
            )}`,
          );
          this.eventEmitter.emit(
            Events.POSITION_UPDATED,
            new PositionUpdatedEvent(accountName, newPositions),
          );
        }
        this.logger.log(`Fetching positions for ${accountName} account`);
        await delay(Timers.POSITION_UPDATE_COOLDOWN);
      }
    } catch (error) {
      this.logger.error(
        `Error during positions update: ${error.message}`,
        error.stack,
      );
    }
  }

  private hasPositionsChanged(
    accountName: string,
    newPositions: Position[],
  ): boolean {
    const currentPositions = this.positions[accountName] || [];
    try {
      return JSON.stringify(newPositions) !== JSON.stringify(currentPositions);
    } catch (error) {
      this.logger.error('Error during positions comparison', error.stack);
      throw new PositionComparisonException(error);
    }
  }
}
