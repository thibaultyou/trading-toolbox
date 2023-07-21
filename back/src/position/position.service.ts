import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';

import { AccountService } from '../account/account.service';
import { Events, Timers } from '../app.constants';
import { ExchangeService } from '../exchange/exchange.service';

import { PositionUpdatedEvent } from './events/position-updated.event';

@Injectable()
export class PositionService implements OnModuleInit {
  private logger = new Logger(PositionService.name);
  private positions: Record<string, any[]> = {}; // replace 'any' with your position type

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
    private accountService: AccountService,
  ) {}

  async onModuleInit() {
    try {
      await this.updatePositions();
      setInterval(async () => {
        await this.updatePositions();
      }, Timers.POSITION_UPDATE_COOLDOWN);
    } catch (error) {
      this.logger.error('Error during module initialization', error.stack);
    }
  }

  // TODO replace 'any' with your position type
  async getPositions(accountName: string): Promise<any[]> {
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
    }
  }

  private hasPositionsChanged(
    accountName: string,
    newPositions: any[],
  ): boolean {
    // replace 'any' with your position type
    // implement comparison logic here to check if positions have changed
    // this is a simplistic example and might not suit your needs
    try {
      const currentPositions = this.positions[accountName] || [];
      return JSON.stringify(newPositions) !== JSON.stringify(currentPositions);
    } catch (error) {
      this.logger.error('Error during positions comparison', error.stack);
      return false;
    }
  }
}
