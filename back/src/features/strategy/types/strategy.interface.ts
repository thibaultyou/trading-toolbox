import { IStrategyOptions } from './strategy-options.interface';
import { StrategyType } from './strategy-type.enum';

export interface IStrategy {
  id: string;
  type: StrategyType;
  marketId: string;
  options: IStrategyOptions;
  orders: string[];
  takeProfitOrderId?: string;
  stopLossOrderId?: string;
}
