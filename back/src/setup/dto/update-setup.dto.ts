import { ApiProperty } from '@nestjs/swagger';
import {
  IsOptional,
  IsEnum,
  IsInt,
  Min,
  ValidateNested,
} from 'class-validator';
import { TriggerType, StatusType } from '../../common.types';
import { Action } from '../../action/entities/action.entity';
import { Type } from 'class-transformer';

export class UpdateSetupDto {
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
