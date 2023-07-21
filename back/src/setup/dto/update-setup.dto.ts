import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';

import { Action } from '../../action/entities/action.entity';
import { TriggerType, StatusType } from '../../common/common.types';

export class UpdateSetupDto {
  @ApiProperty({ required: false })
  @IsOptional()
  readonly id?: string;

  @ApiProperty({ required: false })
  readonly ticker?: string;

  @ApiProperty({ required: false })
  readonly account?: string;

  @ApiProperty({ enum: TriggerType, required: false })
  @IsOptional()
  @IsEnum(TriggerType)
  readonly trigger?: TriggerType;

  @ApiProperty({ required: false })
  @IsOptional()
  readonly value?: number;

  @ApiProperty({ enum: StatusType, required: false })
  @IsOptional()
  @IsEnum(StatusType)
  readonly status?: StatusType;

  @ApiProperty({ required: false })
  @IsOptional()
  @IsInt()
  @Min(0)
  readonly retries?: number;

  @ApiProperty({ type: () => [Action], required: false })
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => Action)
  readonly actions?: Action[];
}
