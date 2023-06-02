import { ApiProperty } from '@nestjs/swagger';
import {
  IsNotEmpty,
  IsEnum,
  IsInt,
  Min,
  ValidateNested,
  IsOptional,
  ArrayMinSize,
} from 'class-validator';
import { TriggerType, StatusType } from '../../common.types';
import { Action } from '../../action/entities/action.entity';
import { Type } from 'class-transformer';

export class CreateSetupDto {
  @ApiProperty()
  @IsNotEmpty()
  readonly ticker: string;

  @ApiProperty()
  @IsNotEmpty()
  readonly account: string;

  @ApiProperty({ enum: TriggerType, default: TriggerType.NONE })
  @IsEnum(TriggerType)
  readonly trigger: TriggerType;

  @ApiProperty()
  @IsOptional()
  readonly value: number;

  @ApiProperty({ enum: StatusType, default: StatusType.PENDING })
  @IsEnum(StatusType)
  readonly status: StatusType = StatusType.PENDING;

  @ApiProperty({ required: false, default: 0 })
  @IsInt()
  @Min(0)
  readonly retries: number = 0;

  @ApiProperty({ type: () => [Action] })
  @ValidateNested({ each: true })
  @Type(() => Action)
  @ArrayMinSize(1)
  actions: Action[];
}
