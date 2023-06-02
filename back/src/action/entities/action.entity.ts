import {
  Entity,
  Column,
  PrimaryGeneratedColumn,
  ManyToOne,
  JoinColumn,
} from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Setup } from '../../setup/entities/setup.entity';
import { ActionType } from '../action.types';
import { CreateActionDto } from '../dto/create-action.dto';
import { UpdateActionDto } from '../dto/update-action.dto';
import { TriggerType, StatusType } from '../../common.types';
import { IsNotEmpty, ValidateIf } from 'class-validator';

@Entity()
export class Action {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ nullable: true, default: 0 })
  @Column()
  order: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50 })
  type: ActionType;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: true })
  trigger: TriggerType;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: true })
  value: string;

  @ApiProperty()
  @ValidateIf((o) => o.trigger !== null)
  @Column({ type: 'varchar', length: 50, nullable: true })
  trigger_value: string;

  @ApiProperty()
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: StatusType.PENDING,
  })
  status?: StatusType;

  @ManyToOne(() => Setup, (setup) => setup.actions)
  setup: Setup;

  static fromDto(data: CreateActionDto | UpdateActionDto): Action {
    const action = new Action();
    action.order = data.order;
    action.type = data.type;

    // Validation for trigger
    if (data.trigger && Object.values(TriggerType).includes(data.trigger)) {
      action.trigger = data.trigger;
    } else if (data.trigger) {
      throw new Error(`Invalid trigger type: ${data.trigger}`);
    }

    // Validation for status
    if ('status' in data && Object.values(StatusType).includes(data.status)) {
      action.status = data.status;
    } else if ('status' in data) {
      throw new Error(`Invalid status type: ${data.status}`);
    } else {
      action.status = StatusType.PENDING;
    }

    action.value = data.value;
    action.trigger_value = data.trigger_value;
    return action;
  }
}
