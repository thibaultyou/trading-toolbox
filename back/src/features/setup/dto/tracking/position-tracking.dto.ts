import { ApiProperty } from '@nestjs/swagger';

import { PositionStatus } from '../../types/enums/position-status.enum';
import { IPositionTracking } from '../../types/interfaces/position-tracking.interface';

export class PositionTrackingDto implements IPositionTracking {
  @ApiProperty({
    description: 'Identifier for the tracked position',
    example: 'position123'
  })
  positionId: string;

  @ApiProperty({
    description: 'Market ID associated with the position',
    example: 'BTCUSDT'
  })
  marketId: string;

  @ApiProperty({
    description: 'Status of the position, such as open or closed',
    example: 'open'
  })
  status: PositionStatus;
}
