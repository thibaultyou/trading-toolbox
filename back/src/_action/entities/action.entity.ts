import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, ManyToOne } from 'typeorm';

import { Setup } from '../../_setup/entities/setup.entity';
import { TriggerType, StatusType } from '../../common/types/common.types';
import { ActionType, ValueType } from '../action.types';
import { CreateActionDto } from '../dto/create-action.dto';
import { UpdateActionDto } from '../dto/update-action.dto';

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
  @Column({ type: 'varchar', length: 50, nullable: true })
  value_type: ValueType;

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

  @ValidateIf((o) =>
    [ActionType.MARKET_LONG, ActionType.MARKET_SHORT].includes(o.type),
  )
  @Column({ type: 'varchar', length: 50, nullable: true })
  take_profit?: string;

  @ValidateIf((o) =>
    [ActionType.MARKET_LONG, ActionType.MARKET_SHORT].includes(o.type),
  )
  @Column({ type: 'varchar', length: 50, nullable: true })
  stop_loss?: string;

  @ManyToOne(() => Setup, (setup) => setup.actions)
  setup: Setup;

  static fromDto(data: CreateActionDto | UpdateActionDto): Action {
    const action = new Action();
    action.id = data.id;
    action.order = data.order;
    action.type = data.type;

    if (data.trigger && Object.values(TriggerType).includes(data.trigger)) {
      action.trigger = data.trigger;
    } else if (data.trigger) {
      throw new Error(`Invalid trigger type: ${data.trigger}`);
    }

    if ('status' in data && Object.values(StatusType).includes(data.status)) {
      action.status = data.status;
    } else if ('status' in data) {
      throw new Error(`Invalid status type: ${data.status}`);
    } else {
      action.status = StatusType.PENDING;
    }

    action.value = data.value;

    if (
      'value_type' in data &&
      Object.values(ValueType).includes(data.value_type)
    ) {
      action.value_type = data.value_type;
    } else {
      action.value_type = ValueType.CONTRACTS;
    }

    action.trigger_value = data.trigger_value;
    action.take_profit = data.take_profit;
    action.stop_loss = data.stop_loss;
    return action;
  }
}
