import React from 'react';
import {
  MenuItem,
  Select,
  SelectChangeEvent,
  TextField,
  Typography,
} from '@mui/material';
import { TriggerType } from '../../types/common.types';
import { useSetupFormContext } from '../../containers/SetupFormContext';

const TriggerForm: React.FC = () => {
  const { setup, setSetup } = useSetupFormContext();

  const triggers = Object.values(TriggerType).filter(
    (trigger) => trigger !== TriggerType.TRADINGVIEW,
  );

  const handleTriggerChange = (event: SelectChangeEvent) => {
    setSetup({
      ...setup,
      trigger: event.target.value as TriggerType,
      value: event.target.value === TriggerType.NONE ? undefined : setup.value,
    });
  };

  const handleValueChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSetup({
      ...setup,
      value: parseFloat(event.target.value as string),
    });
  };

  const isTriggerSelected = setup.trigger !== TriggerType.NONE;

  return (
    <>
      <Typography sx={{ mt: 1, mb: 1 }}>Trigger</Typography>
      <Select
        value={setup.trigger || 'NONE'}
        onChange={handleTriggerChange}
        fullWidth
      >
        {triggers.map((trigger, index) => (
          <MenuItem key={index} value={trigger}>
            {trigger}
          </MenuItem>
        ))}
      </Select>
      {isTriggerSelected && (
        <>
          <Typography sx={{ mt: 1, mb: 1 }}>Value</Typography>
          <TextField
            type="number"
            fullWidth
            value={setup.value || ''}
            onChange={handleValueChange}
            variant="outlined"
          />
        </>
      )}
    </>
  );
};

export default TriggerForm;
