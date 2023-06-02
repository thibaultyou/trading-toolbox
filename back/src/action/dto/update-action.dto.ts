import { ApiProperty } from '@nestjs/swagger';
import { ActionType } from '../action.types';
import { IsOptional, IsUUID, IsEnum, IsInt, Min } from 'class-validator';
import { TriggerType, StatusType } from '../../common.types';

export class UpdateActionDto {
  @ApiProperty({ required: false })
  @IsOptional()
  @IsEnum(ActionType)
  readonly type?: ActionType;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly value?: string;

  @ApiProperty({ enum: TriggerType, required: false })
  @IsOptional()
  @IsEnum(TriggerType)
  readonly trigger?: TriggerType;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly trigger_value?: string;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly order?: number;

  @ApiProperty({ enum: StatusType, required: false })
  @IsOptional()
  @IsEnum(StatusType)
  readonly status?: StatusType;
}
