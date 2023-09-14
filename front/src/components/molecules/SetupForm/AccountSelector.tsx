import {
  Box,
  MenuItem,
  Select,
  SelectChangeEvent,
  Typography,
} from '@mui/material';
import { useSetupFormContext } from '../../../containers/SetupFormContext';
import { useAccountsContext } from '../../../containers/AccountsContext';
import { useEffect } from 'react';

const AccountSelector: React.FC = () => {
  const { setup, setSetup } = useSetupFormContext();
  const { accounts } = useAccountsContext();

  const handleAccountChange = (e: SelectChangeEvent) => {
    setSetup((prevSetup) => ({ ...prevSetup, account: e.target.value }));
  };

  useEffect(() => {
    if (setup.account === '' && accounts.length) {
      setSetup((prevSetup) => ({ ...prevSetup, account: accounts[0].name }));
    }
  }, [accounts, setup.account, setSetup]);

  return (
    <Box sx={{ mt: 1 }}>
      <Typography sx={{ mb: 1 }}>Account</Typography>
      <Select
        value={setup.account}
        onChange={handleAccountChange}
        fullWidth
        inputProps={{ name: 'account' }}
      >
        {accounts.map(({ name }) => (
          <MenuItem key={name} value={name}>
            {name}
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default AccountSelector;
