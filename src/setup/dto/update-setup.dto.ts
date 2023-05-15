import { ApiProperty } from '@nestjs/swagger';
import { Action } from '../entities/action.entity';
import { TriggerType, StatusType } from '../setup.types';

export class UpdateSetupDto {
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

  @ApiProperty({ enum: StatusType })
  status: StatusType;

  @ApiProperty({ type: [Action] })
  actions: Action[];
}
