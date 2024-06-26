import { TriggerType } from '../types/common.types';

export const TriggerOptions = Object.values(TriggerType).filter(
  (t) => t !== TriggerType.TRADINGVIEW,
);
