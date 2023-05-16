import { ApiProperty } from '@nestjs/swagger';
import { ActionType, TriggerType, StatusType } from '../action.types';

export class UpdateActionDto {
  @ApiProperty({ required: false })
  readonly type?: ActionType;

  @ApiProperty({ required: false })
  readonly value?: string;

  @ApiProperty({ enum: TriggerType, required: false })
  readonly trigger?: TriggerType;

  @ApiProperty({ required: false })
  readonly order?: number;

  @ApiProperty({ enum: StatusType, required: false })
  readonly status?: StatusType;

  @ApiProperty({ required: false })
  readonly setupId?: string;
}
