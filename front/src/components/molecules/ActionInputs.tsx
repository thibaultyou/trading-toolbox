import React, { useEffect } from 'react';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ClearIcon from '@mui/icons-material/Clear';
import { Action, ActionType } from '../../types/action.types';
import { TriggerType } from '../../types/common.types';
import { Box, Button, TextField, MenuItem, Select, Typography, Stack, Divider, SelectChangeEvent } from '@mui/material';
import { useSetupFormContext } from '../../containers/SetupFormContext';

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

  const updateAction = (update: Partial<Action>) => {
    const actions = [...setup.actions];
    actions[index] = { ...actions[index], ...update };
    setSetup({ ...setup, actions });
  };

  useEffect(() => {
    const isTriggerValid = action.trigger === TriggerType.NONE || action.trigger_value?.length !== 0;
    const isActionValid = Boolean(action.value.length);
    setActionsValidity(isTriggerValid && isActionValid);
  }, [setup, action.trigger, action.trigger_value, action.value, setActionsValidity]);

  const handleOrderPriority = (direction: number) => {
    let actions = [...setup.actions];
    if ((direction === -1 && index !== 0) || (direction === 1 && index !== actions.length - 1)) {
      actions[index].order += direction;
      actions[index + direction].order -= direction;
    }
    setSetup({ ...setup, actions: actions.sort((a, b) => a.order - b.order) });
  }

  const handleTriggerChange = (event: SelectChangeEvent) => {
    const trigger = event.target.value as TriggerType;
    updateAction({ trigger, trigger_value: trigger === TriggerType.NONE ? '' : action.trigger_value });
  };

  const handleTriggerValueChange = (event: any) => {
    updateAction({ trigger_value: event.target.value });
  };

  const handleValueChange = (event: any) => {
    updateAction({ value: event.target.value });
  };

  const handleTypeChange = (event: SelectChangeEvent) => {
    updateAction({ type: event.target.value as ActionType });
  };

  const removeOrder = () => {
    let actions = [...setup.actions];
    actions.splice(index, 1);
    actions.map(action => action.order > index ? { ...action, order: action.order -= 1 } : action)
    setSetup({ ...setup, actions: actions });
  }

  return (
    <>
      {index !== 0 && (
        <Box sx={{ mt: 3 }}>
          <Divider variant="middle" />
        </Box >
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
          <Stack
            direction="row"
            justifyContent="flex-end"
            alignItems="center"
          >
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
      <Box sx={{ mt: 1 }} >
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
        <Box sx={{ mt: 1 }}>
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
          />
        </Box>
      )}
      <Box sx={{ mt: 1 }} >
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
      <Box sx={{ mt: 1 }}>
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
        />
      </Box>
    </>
  );
};

export default ActionInputs;
