import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { Events, Timers } from '../../config';
import { ExchangeService } from '../../features/exchange/exchange.service';
import { delay } from '../../utils/delay.util';
import { PositionsUpdatedEvent } from './events/positions-updated.event';
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
    const initializedAccountIds =
      this.exchangeService.getInitializedAccountIds();

    try {
      for (const accountId of initializedAccountIds) {
        const newPositions =
          await this.exchangeService.getOpenPositions(accountId);

        if (this.hasPositionsChanged(accountId, newPositions)) {
          this.positions[accountId] = newPositions;
          this.logger.debug(
            `Updating positions for ${accountId} account: ${JSON.stringify(
              newPositions,
            )}`,
          );
          this.eventEmitter.emit(
            Events.POSITION_UPDATED,
            new PositionsUpdatedEvent(accountId, newPositions),
          );
        }

        this.logger.log(`Fetching positions for ${accountId} account`);
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
    accountId: string,
    newPositions: Position[],
  ): boolean {
    const currentPositions = this.positions[accountId] || [];

    try {
      return JSON.stringify(newPositions) !== JSON.stringify(currentPositions);
    } catch (error) {
      this.logger.error('Error during positions comparison', error.stack);
      throw new PositionComparisonException(error);
    }
  }
}
