import { ApiProperty } from '@nestjs/swagger';

import { Action } from '../../_action/entities/action.entity';
import { TriggerType, StatusType } from '../../common/types/common.types';

export class ReceiveAlertDto {
  @ApiProperty()
  market: string;

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
