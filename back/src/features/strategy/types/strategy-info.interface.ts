import { IStrategy } from './strategy.interface';
import { BaseStrategy } from '../strategies/base-strategy';

export interface IStrategyInfo {
  config: IStrategy;
  instance: BaseStrategy;
}
