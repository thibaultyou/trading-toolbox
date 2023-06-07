import React, { useCallback, useEffect } from 'react';
import AddIcon from '@mui/icons-material/Add';
import { Box, Button, Divider } from '@mui/material';
import { ActionType } from '../../types/action.types';
import { TriggerType } from '../../types/common.types';
import ActionInput from '../molecules/ActionInputs';
import { useSetupFormContext } from '../../containers/SetupFormContext';

const ActionForm: React.FC = () => {
  const { setup, setSetup } = useSetupFormContext();
  const handleAddAction = useCallback(() => {
    setSetup({
      ...setup,
      actions: [
        ...setup.actions,
        {
          order: setup.actions.length,
          type: ActionType.MARKET_LONG,
          trigger: TriggerType.NONE,
          trigger_value: '',
          value: '',
        },
      ],
    });
  }, [setup, setSetup]);

  useEffect(() => {
    if (setup.actions.length === 0) {
      handleAddAction();
    }
  }, [setup, handleAddAction]);

  return (
    <>
      {setup.actions.map((action, idx) => (
        <React.Fragment key={idx}>
          <ActionInput action={action} index={idx} />
          {idx === setup.actions.length - 1 && (
            <Box sx={{ mt: 1 }}>
              <Divider variant="middle">
                <Button onClick={handleAddAction} startIcon={<AddIcon />}>
                  Add action
                </Button>
              </Divider>
            </Box>
          )}
        </React.Fragment>
      ))}
    </>
  );
};
export default ActionForm;
