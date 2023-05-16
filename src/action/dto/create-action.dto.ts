import { ApiProperty } from '@nestjs/swagger';
import { ActionType, TriggerType, StatusType } from '../action.types';

export class CreateActionDto {
  @ApiProperty()
  readonly type: ActionType;

  @ApiProperty()
  readonly value: string;

  @ApiProperty({ enum: TriggerType })
  readonly trigger: TriggerType;

  @ApiProperty()
  readonly order: number;

  @ApiProperty({ enum: StatusType })
  readonly status: StatusType;

  @ApiProperty()
  readonly setupId: string;
}
