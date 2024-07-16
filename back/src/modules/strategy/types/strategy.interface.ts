import { StrategyOptions } from './strategy-options.type';
import { StrategyType } from './strategy-type.enum';

export interface IStrategy {
  id: string;
  accountId: string;
  type: StrategyType;
  marketId: string;
  options: StrategyOptions;
  orders: string[];
  takeProfitOrderId?: string;
  stopLossOrderId?: string;
}
