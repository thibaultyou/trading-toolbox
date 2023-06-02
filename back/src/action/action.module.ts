import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ActionService } from './action.service';
import { Action } from './entities/action.entity';
import { ActionController } from './action.controller';
import { EventEmitterModule } from '@nestjs/event-emitter';
import { SetupModule } from '../setup/setup.module';

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
