import React, { useEffect } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ClearIcon from '@mui/icons-material/Clear';
import { Action, ActionType, ValueType } from '../../../types/action.types';
import { TriggerType } from '../../../types/common.types';
import {
  Box,
  Button,
  TextField,
  MenuItem,
  Select,
  Typography,
  Stack,
  Divider,
  SelectChangeEvent,
  InputAdornment,
} from '@mui/material';
import { useSetupFormContext } from '../../../containers/SetupFormContext';

interface Props {
  action: Action;
  index: number;
}

const actionTypes = Object.values(ActionType);

const triggerTypes = Object.values(TriggerType).filter(
  (type) => type !== TriggerType.TRADINGVIEW,
);

const ActionInputs: React.FC<Props> = ({ action, index }) => {
  const { setup, setSetup, setActionsValidity } = useSetupFormContext();

  const handleUpdateAction = (update: Partial<Action>) => {
    const actions = [...setup.actions];
    actions[index] = { ...actions[index], ...update };
    setSetup({ ...setup, actions });
  };

  useEffect(() => {
    const isTriggerValid =
      action.trigger === TriggerType.NONE || action.trigger_value?.length !== 0;
    const isActionValid = Boolean(action.value.length);
    setActionsValidity(isTriggerValid && isActionValid);
  }, [
    setup,
    action.trigger,
    action.trigger_value,
    action.value,
    setActionsValidity,
  ]);

  const handleOrderPriority = (direction: number) => {
    let actions = [...setup.actions];
    if (
      (direction === -1 && index !== 0) ||
      (direction === 1 && index !== actions.length - 1)
    ) {
      actions[index].order += direction;
      actions[index + direction].order -= direction;
    }
    // setSetup({ ...setup, actions: actions.sort((a, b) => a.order - b.order) });

  };

  const handleTriggerChange = (event: SelectChangeEvent) => {
    const trigger = event.target.value as TriggerType;
    handleUpdateAction({
      trigger,
      trigger_value: trigger === TriggerType.NONE ? '' : action.trigger_value,
    });
  };

  const handleTriggerValueChange = (event: any) => {
    handleUpdateAction({ trigger_value: event.target.value });
  };

  const handleValueChange = (event: any) => {
    const value = event.target.value;
    let valueType = action.value_type;  // assuming value_type is the ValueType property in action

    if (value.includes('%')) {
      valueType = ValueType.PERCENTAGE;
    } else if (value.includes('$')) {
      valueType = ValueType.COST;
    } else {
      valueType = ValueType.CONTRACTS;
    }

    handleUpdateAction({ value, value_type: valueType });
  };


  const handleTypeChange = (event: SelectChangeEvent) => {
    handleUpdateAction({ type: event.target.value as ActionType });
  };

  const handleTakeProfitChange = (event: any) => {
    handleUpdateAction({ take_profit: event.target.value });
  };

  const handleStopLossChange = (event: any) => {
    handleUpdateAction({ stop_loss: event.target.value });
  };

  const removeOrder = () => {
    let actions = [...setup.actions];
    actions.splice(index, 1);
    actions.map((action) =>
      action.order > index ? { ...action, order: (action.order -= 1) } : action,
    );
    setSetup({ ...setup, actions: actions });
  };

  return (
    <>
      {index !== 0 && (
        <Box sx={{ mt: 3 }}>
          <Divider variant="middle" />
        </Box>
      )}
      <Box sx={{ mt: 1 }}>
        <Stack
          direction="row"
          justifyContent="space-between"
          alignItems="center"
        >
          <Typography variant="h6" sx={{ mt: 1 }}>
            # {action.order}
          </Typography>
          <Stack direction="row" justifyContent="flex-end" alignItems="center">
            {index !== 0 && (
              <Button onClick={() => handleOrderPriority(-1)}>
                <ArrowUpwardIcon />
              </Button>
            )}
            {setup.actions.length !== 1 && (
              <>
                <Button onClick={() => handleOrderPriority(1)}>
                  <ArrowDownwardIcon />
                </Button>
                <Button color="error" onClick={removeOrder}>
                  <ClearIcon />
                </Button>
              </>
            )}
          </Stack>
        </Stack>
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Box sx={{ flex: 1, mr: 1 }}>
          <Typography sx={{ mt: 1, mb: 1 }}>Trigger</Typography>
          <Select
            id="trigger"
            name="trigger"
            value={action.trigger}
            onChange={handleTriggerChange}
            fullWidth
          >
            {triggerTypes.map((type, index) => (
              <MenuItem key={index} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </Box>
        {action.trigger !== TriggerType.NONE && (
          <Box sx={{ flex: 1, ml: 1 }}>
            <Typography sx={{ mt: 1, mb: 1 }}>Trigger value</Typography>
            <TextField
              id="trigger_value"
              type="text"
              name="trigger_value"
              value={action.trigger_value}
              onChange={handleTriggerValueChange}
              placeholder="Trigger value"
              fullWidth
              variant="outlined"
              error={action.trigger_value?.length === 0}
              helperText={
                action.trigger_value?.length === 0 &&
                'Trigger value is required'
              }
            />
          </Box>
        )}
      </Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
        <Box sx={{ flex: 1, mr: 1 }}>
          <Typography sx={{ mt: 1, mb: 1 }}>Type</Typography>
          <Select
            id="type"
            name="type"
            value={action.type}
            onChange={handleTypeChange}
            fullWidth
          >
            {actionTypes.map((type, index) => (
              <MenuItem key={index} value={type}>
                {type}
              </MenuItem>
            ))}
          </Select>
        </Box>
        <Box sx={{ flex: 1, ml: 1 }}>
          <Typography sx={{ mt: 1, mb: 1 }}>Value</Typography>
          <TextField
            id="value"
            type="text"
            name="value"
            value={action.value}
            onChange={handleValueChange}
            placeholder="Value"
            fullWidth
            variant="outlined"
            error={action.value.length === 0}
            helperText={action.value.length === 0 && 'Value is required'}
          />
        </Box>
      </Box>
      {action.type === ActionType.MARKET_LONG ||
        action.type === ActionType.MARKET_SHORT ? (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 1 }}>
          <Box sx={{ flex: 1, mr: 1 }}>
            <Typography sx={{ mt: 1, mb: 1 }}>Take profit</Typography>
            <TextField
              id="take_profit"
              type="text"
              name="take_profit"
              value={action.take_profit || ''}
              onChange={handleTakeProfitChange}
              placeholder="Take profit"
              fullWidth
              variant="outlined"
            />
          </Box>
          <Box sx={{ flex: 1, ml: 1 }}>
            <Typography sx={{ mt: 1, mb: 1 }}>Stop loss</Typography>
            <TextField
              id="stop_loss"
              type="text"
              name="stop_loss"
              value={action.stop_loss || ''}
              onChange={handleStopLossChange}
              placeholder="Stop loss"
              fullWidth
              variant="outlined"
            />
          </Box>
        </Box>
      ) : null}
    </>
  );
};

export default ActionInputs;
