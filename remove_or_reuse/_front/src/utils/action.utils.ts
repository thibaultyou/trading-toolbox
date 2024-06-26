import { Action } from '../types/action.types';
import { StatusType } from '../types/common.types';

export const areAllActionsPaused = (actions: Action[]): boolean => {
  return actions.every((action) => action.status === StatusType.PAUSED);
};
