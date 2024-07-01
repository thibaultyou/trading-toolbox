import { ApiProperty } from '@nestjs/swagger';

import { ConditionType } from '../../types/enums/condition-types.enum';
import { ICondition } from '../../types/interfaces/condition.interface';

export class ConditionDto implements ICondition {
  @ApiProperty({
    description: 'Type of condition, such as priceAbove, priceBelow, or time',
    example: 'priceAbove'
  })
  type: ConditionType;

  @ApiProperty({
    description: 'Reference value for the condition, could be a price or a timestamp',
    example: 10000
  })
  referenceValue: number | Date;
}
