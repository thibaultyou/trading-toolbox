import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setup } from './entities/setup.entity';
import { SetupCreatedEvent } from './events/setup-created.event';
import { SetupUpdatedEvent } from './events/setup-updated.event';
import { SetupDeletedEvent } from './events/setup-deleted.event';
import { AppLogger } from '../logger.service';

@Injectable()
export class SetupService {
  private logger = new AppLogger(SetupService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectRepository(Setup)
    private setupRepository: Repository<Setup>,
  ) {}

  async findAll(): Promise<Setup[]> {
    this.logger.log('Fetching all setups');
    return this.setupRepository.find();
  }

  async findOne(id: string): Promise<Setup> {
    this.logger.log(`Fetching setup with id: ${id}`);
    const setup = await this.setupRepository.findOne({
      where: {
        id,
      },
    });
    return setup;
  }

  async create(ticker: string): Promise<Setup> {
    this.logger.log(`Creating setup with ticker: ${ticker}`);
    const setup = new Setup(ticker);
    const savedSetup = await this.setupRepository.save(setup);
    this.eventEmitter.emit(
      'setup.created',
      new SetupCreatedEvent(savedSetup.id, savedSetup.ticker),
    );
    this.logger.log(`Setup created with id: ${savedSetup.id}`);
    return savedSetup;
  }

  async update(id: string, ticker: string): Promise<Setup> {
    this.logger.log(`Updating setup with id: ${id}`);
    const setup = await this.findOne(id);
    setup.ticker = ticker;
    const updatedSetup = await this.setupRepository.save(setup);
    this.eventEmitter.emit(
      'setup.updated',
      new SetupUpdatedEvent(updatedSetup.id, updatedSetup.ticker),
    );
    this.logger.log(`Setup updated with id: ${updatedSetup.id}`);
    return updatedSetup;
  }

  async delete(id: string): Promise<void> {
    this.logger.log(`Deleting setup with id: ${id}`);
    await this.setupRepository.delete(id);
    this.eventEmitter.emit('setup.deleted', new SetupDeletedEvent(id));
    this.logger.log(`Setup deleted with id: ${id}`);
  }
}
