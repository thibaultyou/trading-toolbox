import { PositionStatus } from '../enums/position-status.enum';

export interface IPositionTracking {
  positionId: string;
  marketId: string;
  status: PositionStatus;
}
