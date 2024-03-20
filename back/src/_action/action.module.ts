import { Module } from '@nestjs/common';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { TypeOrmModule } from '@nestjs/typeorm';

import { SetupModule } from '../_setup/setup.module';

import { ActionController } from './action.controller';
import { ActionService } from './action.service';
import { Action } from './entities/action.entity';

@Module({
  imports: [
    EventEmitterModule,
    TypeOrmModule.forFeature([Action]),
    SetupModule,
  ],
  providers: [ActionService],
  controllers: [ActionController],
  exports: [ActionService],
})
export class ActionModule {}
