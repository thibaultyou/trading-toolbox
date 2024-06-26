// import { Module } from '@nestjs/common';
// import { EventEmitterModule } from '@nestjs/event-emitter';
// import { TypeOrmModule } from '@nestjs/typeorm';

// import { ActionService } from '../_action/action.service';
// import { Action } from '../_action/entities/action.entity';
// import { Setup } from './entities/setup.entity';
// import { AlertReceivedHandler } from './handlers/alert-received.event-handler';
// import { SetupController } from './setup.controller';
// import { SetupService } from './setup.service';

// @Module({
//   imports: [EventEmitterModule, TypeOrmModule.forFeature([Setup, Action])],
//   providers: [SetupService, ActionService, AlertReceivedHandler],
//   controllers: [SetupController],
//   exports: [SetupService],
// })
// export class SetupModule {}
