// import { ApiProperty } from '@nestjs/swagger';
// import { IsEnum, IsInt, IsNotEmpty, IsOptional, Min } from 'class-validator';

// import { StatusType, TriggerType } from '../../common/types/common.types';
// import { ActionType, ValueType } from '../action.types';

// export class CreateActionDto {
//   @ApiProperty({ required: false })
//   @IsOptional()
//   readonly id?: string;

//   @ApiProperty()
//   @IsNotEmpty()
//   @IsEnum(ActionType)
//   readonly type: ActionType;

//   @ApiProperty()
//   @IsNotEmpty()
//   readonly value: string;

//   @ApiProperty({ enum: ValueType, default: ValueType.CONTRACTS })
//   @IsEnum(ValueType)
//   readonly value_type: ValueType;

//   @ApiProperty({ enum: TriggerType, default: TriggerType.NONE })
//   @IsEnum(TriggerType)
//   readonly trigger: TriggerType;

//   @ApiProperty()
//   @IsOptional()
//   readonly trigger_value?: string;

//   @ApiProperty()
//   @IsNotEmpty()
//   @IsInt()
//   @Min(0)
//   readonly order: number;

//   @ApiProperty({ enum: StatusType, default: StatusType.PENDING })
//   @IsEnum(StatusType)
//   readonly status: StatusType;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   readonly take_profit?: string;

//   @ApiProperty({ required: false })
//   @IsOptional()
//   readonly stop_loss?: string;
// }
