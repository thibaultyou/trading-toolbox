import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { PositionUpdatedEvent } from './events/position-updated.event';
import { ExchangeService } from '../exchange/exchange.service';

@Injectable()
export class PositionService implements OnModuleInit {
  private logger = new Logger(PositionService.name);
  private positions: any[] = []; // replace with your position type

  constructor(
    private eventEmitter: EventEmitter2,
    private exchangeService: ExchangeService,
  ) {}

  async onModuleInit() {
    await this.updatePositions();
    setInterval(async () => {
      await this.updatePositions();
    }, 5000);
  }

  async getPositions(): Promise<any[]> {
    return this.positions;
  }

  private async updatePositions() {
    const newPositions = await this.exchangeService.getOpenPositions();

    if (this.hasPositionsChanged(newPositions)) {
      this.logger.log('Positions updated');
      this.positions = newPositions;
      this.eventEmitter.emit(
        'positions.updated',
        new PositionUpdatedEvent(newPositions),
      );
    }
  }

  private hasPositionsChanged(newPositions: any[]): boolean {
    // implement comparison logic here to check if positions have changed
    // this is a simplistic example and might not suit your needs
    return JSON.stringify(newPositions) !== JSON.stringify(this.positions);
  }
}
