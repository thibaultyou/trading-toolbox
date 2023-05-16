import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { SetupService } from './setup.service';
import { Setup } from './entities/setup.entity';
import { SetupController } from './setup.controller';
import { AlertReceivedHandler } from './handlers/alert-received.event-handler';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { Action } from '../action/entities/action.entity';

@Module({
  imports: [EventEmitterModule, TypeOrmModule.forFeature([Setup, Action])],
  providers: [SetupService, AlertReceivedHandler],
  controllers: [SetupController],
  exports: [SetupService],
})
export class SetupModule { }
