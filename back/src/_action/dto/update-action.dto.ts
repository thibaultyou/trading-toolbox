// import { ApiProperty } from '@nestjs/swagger';
// import { IsEnum, IsInt, IsOptional, Min } from 'class-validator';

// import { StatusType, TriggerType } from '../../common/types/common.types';
// import { ActionType, ValueType } from '../action.types';

// export class UpdateActionDto {
//   @ApiProperty({ required: false })
//   @IsOptional()
//   readonly id?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsEnum(ActionType)
//   readonly type?: ActionType;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   readonly value?: string;

//   @ApiProperty({ enum: ValueType, required: false })
//   @IsOptional()
//   @IsEnum(ValueType)
//   readonly value_type?: ValueType;

//   @ApiProperty({ enum: TriggerType, required: false })
//   @IsOptional()
//   @IsEnum(TriggerType)
//   readonly trigger?: TriggerType;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   readonly trigger_value?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   @IsInt()
//   @Min(0)
//   readonly order?: number;

//   @ApiProperty({ enum: StatusType, required: false })
//   @IsOptional()
//   @IsEnum(StatusType)
//   readonly status?: StatusType;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   readonly take_profit?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   readonly stop_loss?: string;
// }
