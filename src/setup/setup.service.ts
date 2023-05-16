import { Injectable, Logger } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setup } from './entities/setup.entity';
import { SetupCreatedEvent } from './events/setup-created.event';
import { SetupUpdatedEvent } from './events/setup-updated.event';
import { SetupDeletedEvent } from './events/setup-deleted.event';
import { Events } from '../app.constants';
import { Action } from '../action/entities/action.entity';

@Injectable()
export class SetupService {
  private logger = new Logger(SetupService.name);

  constructor(
    private eventEmitter: EventEmitter2,
    @InjectRepository(Setup)
    private setupRepository: Repository<Setup>,
    @InjectRepository(Action)
    private actionRepository: Repository<Action>,
  ) { }

  async findAll(): Promise<Setup[]> {
    try {
      this.logger.log('Fetching all setups');
      return await this.setupRepository.find({ relations: ['actions'] });
    } catch (error) {
      this.logger.error('Error fetching all setups', error.stack);
    }
  }

  async findOne(id: string): Promise<Setup> {
    try {
      this.logger.log(`Fetching setup with id: ${id}`);
      return await this.setupRepository.findOne({
        where: {
          id,
        },
      });
    } catch (error) {
      this.logger.error(`Error fetching setup with id: ${id}`, error.stack);
    }
  }

  async create(setup: Setup): Promise<Setup> {
    try {
      this.logger.log(`Creating setup with ticker: ${setup.ticker}`);
      const savedSetup = await this.setupRepository.save(setup);
      this.eventEmitter.emit(
        Events.SETUP_CREATED,
        new SetupCreatedEvent(savedSetup),
      );
      this.logger.log(`Setup created with id: ${savedSetup.id}`);
      return savedSetup;
    } catch (error) {
      this.logger.error(
        `Error creating setup with ticker: ${setup.ticker}`,
        error.stack,
      );
    }
  }

  async update(id: string, setupUpdate: Setup): Promise<Setup> {
    try {
      this.logger.log(`Updating setup with id: ${id}`);
      const setup = await this.findOne(id);
      Object.assign(setup, setupUpdate);
      const updatedSetup = await this.setupRepository.save(setup);
      this.eventEmitter.emit(
        Events.SETUP_UPDATED,
        new SetupUpdatedEvent(updatedSetup),
      );
      this.logger.log(`Setup updated with id: ${updatedSetup.id}`);
      return updatedSetup;
    } catch (error) {
      this.logger.error(`Error updating setup with id: ${id}`, error.stack);
    }
  }

  async delete(id: string): Promise<void> {
    try {
      this.logger.log(`Deleting setup with id: ${id}`);
      const setup = await this.setupRepository.findOne({ where: { id }, relations: ['actions'] });
      for (const action of setup.actions) {
        await this.actionRepository.delete(action.id);
      }
      await this.setupRepository.delete(id);
      this.eventEmitter.emit(Events.SETUP_DELETED, new SetupDeletedEvent(id));
      this.logger.log(`Setup deleted with id: ${id}`);
    } catch (error) {
      this.logger.error(`Error deleting setup with id: ${id}`, error.stack);
    }
  }
}
