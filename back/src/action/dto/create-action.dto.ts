import { ApiProperty } from '@nestjs/swagger';
import { ActionType } from '../action.types';
import { IsNotEmpty, IsOptional, IsEnum, IsInt, Min } from 'class-validator';
import { StatusType, TriggerType } from '../../common.types';

export class CreateActionDto {
  @ApiProperty()
  @IsNotEmpty()
  @IsEnum(ActionType)
  readonly type: ActionType;

  @ApiProperty()
  @IsNotEmpty()
  readonly value: string;

  @ApiProperty({ enum: TriggerType, default: TriggerType.NONE })
  @IsEnum(TriggerType)
  readonly trigger: TriggerType;

  @ApiProperty()
  @IsOptional()
  readonly trigger_value?: string;

  @ApiProperty()
  @IsNotEmpty()
  @IsInt()
  @Min(0)
  readonly order: number;

  @ApiProperty({ enum: StatusType, default: StatusType.PENDING })
  @IsEnum(StatusType)
  readonly status: StatusType;
}
