import { BaseStrategy } from '../strategies/base-strategy';
import { IStrategy } from './strategy.interface';

export interface IStrategyInfo {
  config: IStrategy;
  instance: BaseStrategy;
}
