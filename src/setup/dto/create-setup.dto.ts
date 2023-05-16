import { ApiProperty } from '@nestjs/swagger';
import { Action } from '../../action/entities/action.entity';
import { TriggerType } from '../setup.types';

export class CreateSetupDto {
  @ApiProperty()
  ticker: string;

  @ApiProperty()
  size: string;

  @ApiProperty()
  account: string;

  @ApiProperty({ enum: TriggerType })
  trigger: TriggerType;

  @ApiProperty()
  value: number;

  @ApiProperty({ type: [Action] })
  actions: Action[];
}
