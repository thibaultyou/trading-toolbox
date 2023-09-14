import { StatusType } from '../types/common.types';

export const mapColorStatus = {
  [StatusType.ACTIVE]: 'blue',
  [StatusType.TRIGGERED]: 'red',
  [StatusType.PENDING]: 'green',
  [StatusType.PAUSED]: 'orange',
  [StatusType.DONE]: 'gray',
};
