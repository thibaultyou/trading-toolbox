import { Entity, Column, PrimaryGeneratedColumn } from 'typeorm';
import { ApiProperty } from '@nestjs/swagger';
import { ActionType, StatusType } from '../setup.types';

@Entity()
export class Action {
  @ApiProperty()
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @ApiProperty()
  @Column()
  order: number;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50 })
  type: ActionType;

  @ApiProperty({ nullable: true })
  @Column({ nullable: true })
  value: string | null;

  @ApiProperty()
  @Column({ type: 'varchar', length: 50 })
  status: StatusType;
}
