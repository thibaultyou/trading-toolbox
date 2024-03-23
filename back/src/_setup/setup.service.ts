// import { Injectable, Logger } from '@nestjs/common';
// import { EventEmitter2 } from '@nestjs/event-emitter';
// import { InjectRepository } from '@nestjs/typeorm';
// import { Repository } from 'typeorm';

// import { ActionService } from '../_action/action.service';
// import { Events } from '../config';
// import { Setup } from './entities/setup.entity';
// import { SetupCreatedEvent } from './events/setup-created.event';
// import { SetupDeletedEvent } from './events/setup-deleted.event';
// import { SetupUpdatedEvent } from './events/setup-updated.event';
// import {
//   SetupCreateException,
//   SetupDeleteException,
//   SetupFetchAllException,
//   SetupNotFoundException,
//   SetupUpdateException,
// } from './exceptions/setup.exceptions';

// @Injectable()
// export class SetupService {
//   private logger = new Logger(SetupService.name);

//   constructor(
//     private eventEmitter: EventEmitter2,
//     @InjectRepository(Setup)
//     private setupRepository: Repository<Setup>,
//     private actionService: ActionService,
//   ) {}

//   async findAll(): Promise<Setup[]> {
//     try {
//       this.logger.debug('Fetching all setups');

//       return await this.setupRepository.find({ relations: ['actions'] });
//     } catch (error) {
//       this.logger.error('Error fetching all setups', error.stack);
//       throw new SetupFetchAllException(error.message);
//     }
//   }

//   async findOne(id: string): Promise<Setup | null> {
//     try {
//       this.logger.log(`Fetching setup with id: ${id}`);
//       const setup = await this.setupRepository.findOne({
//         where: { id },
//         relations: ['actions'],
//       });

//       if (!setup) throw new SetupNotFoundException(id);

//       return setup;
//     } catch (error) {
//       this.logger.error(`Error fetching setup with id: ${id}`, error.stack);
//       throw new SetupNotFoundException(id);
//     }
//   }

//   async create(setup: Setup): Promise<Setup> {
//     try {
//       this.logger.log(`Creating setup with market: ${setup.market}`);
//       const savedSetup = await this.setupRepository.save(setup);

//       this.eventEmitter.emit(
//         Events.SETUP_CREATED,
//         new SetupCreatedEvent(savedSetup),
//       );
//       this.logger.log(`Setup created with id: ${savedSetup.id}`);

//       return savedSetup;
//     } catch (error) {
//       this.logger.error(
//         `Error creating setup with market: ${setup.market}`,
//         error.stack,
//       );
//       throw new SetupCreateException(setup.market, error.message);
//     }
//   }

//   async update(id: string, setupUpdate: Setup): Promise<Setup> {
//     try {
//       this.logger.log(`Updating setup with id: ${id}`);
//       const setup = await this.findOne(id);

//       if (setup) {
//         const updatedSetup = this.setupRepository.merge(setup, setupUpdate);
//         const savedSetup = await this.setupRepository.save(updatedSetup);

//         this.logger.log(`Setup updated with id: ${savedSetup.id}`);
//         this.eventEmitter.emit(
//           Events.SETUP_UPDATED,
//           new SetupUpdatedEvent(savedSetup),
//         );

//         return savedSetup;
//       } else {
//         throw new SetupNotFoundException(id);
//       }
//     } catch (error) {
//       this.logger.error(`Error updating setup with id: ${id}`, error.stack);
//       throw new SetupUpdateException(id, error.message);
//     }
//   }

//   async delete(id: string): Promise<void> {
//     try {
//       this.logger.log(`Deleting setup with id: ${id}`);
//       const setup = await this.setupRepository.findOne({
//         where: { id },
//         relations: ['actions'],
//       });

//       if (setup) {
//         await Promise.all(
//           setup.actions.map((action) => this.actionService.delete(action.id)),
//         );
//         await this.setupRepository.delete(id);
//         this.eventEmitter.emit(Events.SETUP_DELETED, new SetupDeletedEvent(id));
//         this.logger.log(`Setup deleted with id: ${id}`);
//       } else {
//         throw new SetupNotFoundException(id);
//       }
//     } catch (error) {
//       this.logger.error(`Error deleting setup with id: ${id}`, error.stack);
//       throw new SetupDeleteException(id, error.message);
//     }
//   }
// }
