import { ApiProperty } from '@nestjs/swagger';

import { IRetryPolicy } from '../../types/interfaces/retry-policy.interface';
import { ConditionDto } from '../conditions/condition.dto';

export class RetryPolicyDto implements IRetryPolicy {
  @ApiProperty({
    description: 'Maximum number of attempts for retrying the setup',
    example: 3
  })
  maxAttempts: number;

  @ApiProperty({
    description: 'Number of attempts already made',
    example: 1
  })
  attempts: number;

  @ApiProperty({
    description: 'Condition under which the setup should be reactivated',
    type: ConditionDto,
    required: false
  })
  reactivationCondition?: ConditionDto;
}
