import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Setup } from '../../setup/entities/setup.entity';
import { ActionType, StatusType, TriggerType } from '../action.types';
import { CreateActionDto } from '../dto/create-action.dto';
import { UpdateActionDto } from '../dto/update-action.dto';

@Entity()
export class Action {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty({ nullable: true })
  @Column()
  order: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50 })
  type: ActionType;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  value: string | null;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: true })
  trigger?: TriggerType;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: true })
  status?: StatusType;

  @ManyToOne(() => Setup, (setup) => setup.actions)
  setup: Setup;

  static fromDto(data: CreateActionDto | UpdateActionDto): Action {
    const action = new Action();
    action.order = data.order;
    action.type = data.type;
    action.trigger = data.trigger;
    action.value = data.value;
    action.status = 'status' in data ? data.status : StatusType.PENDING;
    action.setup = null;
    return action;
  }
}
