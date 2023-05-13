import { Injectable } from '@nestjs/common';
import { EventEmitter2 } from '@nestjs/event-emitter';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Setup } from './entities/setup';
import { SetupCreatedEvent } from './events/setup-created.event';
import { SetupUpdatedEvent } from './events/setup-updated.event';
import { SetupDeletedEvent } from './events/setup-deleted.event';

@Injectable()
export class SetupService {
    constructor(
        private eventEmitter: EventEmitter2,
        @InjectRepository(Setup)
        private setupRepository: Repository<Setup>,
    ) { }

    findAll(): Promise<Setup[]> {
        return this.setupRepository.find();
    }

    async findOne(id: string): Promise<Setup> {
        const setup = await this.setupRepository.findOne({
            where: {
                id,
            },
        });
        return setup;
    }

    async create(ticker: string): Promise<Setup> {
        const setup = new Setup(ticker);
        const savedsetup = await this.setupRepository.save(setup);
        this.eventEmitter.emit('setup.created', new SetupCreatedEvent(savedsetup.id, savedsetup.ticker));
        return savedsetup;
    }

    async update(id: string, ticker: string): Promise<Setup> {
        const setup = await this.findOne(id);
        setup.ticker = ticker;
        const updatedSetup = await this.setupRepository.save(setup);
        this.eventEmitter.emit('setup.updated', new SetupUpdatedEvent(updatedSetup.id, updatedSetup.ticker));
        return updatedSetup;
    }

    async delete(id: string): Promise<void> {
        await this.setupRepository.delete(id);
        this.eventEmitter.emit('setup.deleted', new SetupDeletedEvent(id));
    }
}
