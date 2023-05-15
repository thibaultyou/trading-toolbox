import { ApiProperty } from '@nestjs/swagger';
import { TriggerType, StatusType } from '../../setup/setup.types';
import { Action } from '../../setup/entities/action.entity';

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
