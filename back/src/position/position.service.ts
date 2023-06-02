import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { ExchangeService } from '../exchange/exchange.service';
import { Events, Timers } from '../app.constants';
import { PositionUpdatedEvent } from './events/position-updated.event';

@Injectable()
export class PositionService implements OnModuleInit {
  private logger = new Logger(PositionService.name);
  private positions: any[] = []; // replace with your position type

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
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

  async getPositions(): Promise<any[]> {
    return this.positions;
  }

  private async updatePositions() {
    try {
      const newPositions = await this.exchangeService.getOpenPositions();
      if (this.hasPositionsChanged(newPositions)) {
        this.positions = newPositions;
        this.logger.debug(
          `Updating positions: ${JSON.stringify(newPositions)}`,
        );
        this.eventEmitter.emit(
          Events.POSITION_UPDATED,
          new PositionUpdatedEvent(newPositions),
        );
      }
    } catch (error) {
      this.logger.error('Error during updating positions', error.stack);
    }
  }

  private hasPositionsChanged(newPositions: any[]): boolean {
    // implement comparison logic here to check if positions have changed
    // this is a simplistic example and might not suit your needs
    try {
      return JSON.stringify(newPositions) !== JSON.stringify(this.positions);
    } catch (error) {
      this.logger.error('Error during positions comparison', error.stack);
      return false;
    }
  }
}
