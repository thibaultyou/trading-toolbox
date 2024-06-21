import { ConditionType } from '../enums/condition-types.enum';

export interface ICondition {
  type: ConditionType;
  referenceValue: number | Date;
}
