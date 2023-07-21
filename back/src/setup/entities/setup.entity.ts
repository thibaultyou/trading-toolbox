import { BadRequestException } from '@nestjs/common';
import { ApiProperty } from '@nestjs/swagger';
import { ValidateIf, validate } from 'class-validator';
import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';

import { Action } from '../../action/entities/action.entity';
import { TriggerType, StatusType } from '../../common/common.types';
import { CreateSetupDto } from '../dto/create-setup.dto';
import { UpdateSetupDto } from '../dto/update-setup.dto';

@Entity()
export class Setup {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  ticker: string;

  @ApiProperty()
  @Column()
  account: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: true })
  trigger: TriggerType;

  @ApiProperty()
  @ValidateIf((o) => o.trigger !== null)
  @Column({ type: 'double precision', nullable: true })
  value: number;

  @ApiProperty()
  @Column({
    type: 'varchar',
    length: 50,
    nullable: true,
    default: StatusType.PENDING,
  })
  status: StatusType;

  @ApiProperty({ type: () => [Action], default: [] })
  @OneToMany(() => Action, (action) => action.setup, { cascade: true })
  actions: Action[];

  @ApiProperty()
  @Column({ type: 'integer', default: 0 })
  retries: number;

  static async fromDto(data: CreateSetupDto | UpdateSetupDto): Promise<Setup> {
    const setup = new Setup();
    setup.id = data.id;
    setup.ticker = data.ticker;
    setup.account = data.account;

    // Validation for trigger
    if (data.trigger && Object.values(TriggerType).includes(data.trigger)) {
      setup.trigger = data.trigger;
    } else if (data.trigger) {
      throw new Error(`Invalid trigger type: ${data.trigger}`);
    }

    setup.value = 'value' in data ? data.value : null;

    // Validation for status
    if ('status' in data && Object.values(StatusType).includes(data.status)) {
      setup.status = data.status;
    } else if ('status' in data) {
      throw new Error(`Invalid status type: ${data.status}`);
    } else {
      setup.status = StatusType.PENDING;
    }

    // Convert each action DTO into an Action entity
    if (data.actions) {
      setup.actions = data.actions.map((actionDto) =>
        Action.fromDto(actionDto),
      );
    }

    setup.retries = 'retries' in data ? data.retries : 0;
    const errors = await validate(setup);
    if (errors.length > 0) {
      throw new BadRequestException(errors); // Or handle errors in a way you see fit
    }
    return setup;
  }
}
