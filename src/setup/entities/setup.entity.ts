import { Entity, Column, PrimaryGeneratedColumn, OneToMany } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { Action } from '../../action/entities/action.entity';
import { CreateSetupDto } from '../dto/create-setup.dto';
import { TriggerType, StatusType } from '../setup.types';
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
  size: string;

  @ApiProperty()
  @Column()
  account: string;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50 })
  trigger: TriggerType;

  @ApiProperty()
  @Column({ type: 'double precision' })
  value: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50, nullable: true })
  status: StatusType;

  @ApiProperty({ type: () => [Action] })
  @OneToMany(() => Action, (action) => action.setup, {
    cascade: true,
  })
  actions: Action[];

  static fromDto(data: CreateSetupDto | UpdateSetupDto): Setup {
    const setup = new Setup();
    setup.ticker = data.ticker;
    setup.size = data.size;
    setup.account = data.account;
    setup.trigger = data.trigger;
    setup.value = data.value;
    setup.status = 'status' in data ? data.status : StatusType.PENDING;
    setup.actions = data.actions;
    return setup;
  }
}
