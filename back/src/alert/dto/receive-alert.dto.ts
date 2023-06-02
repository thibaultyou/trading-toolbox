import { ApiProperty } from '@nestjs/swagger';
import { TriggerType, StatusType } from '../../common.types';
import { Action } from '../../action/entities/action.entity';

export class ReceiveAlertDto {
  @ApiProperty()
  ticker: string;

  @ApiProperty()
  size: string;

  @ApiProperty()
  account: string;

  @ApiProperty()
  trigger: TriggerType;

  @ApiProperty()
  value: number;

  @ApiProperty()
  status: StatusType;

  @ApiProperty({ type: [Action] })
  actions: Action[];
}
