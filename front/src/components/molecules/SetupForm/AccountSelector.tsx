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
import { useBalancesContext } from '../../../containers/BalancesContext';

const AccountSelector: React.FC = () => {
  const { setup, setSetup } = useSetupFormContext();
  const { accounts } = useAccountsContext();
  const { balances } = useBalancesContext();

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
        displayEmpty
        renderValue={(selected) => {
          const balance = balances[selected] || 'N/A';
          return (
            <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
              <Typography>{selected}</Typography>
              <Typography>{`$${balance}`}</Typography>
            </Box>
          );
        }}
      >
        {accounts.map((account) => (
          <MenuItem key={account.name} value={account.name} sx={{ display: 'flex', justifyContent: 'space-between' }}>
            <span>{account.name}</span>
            <Box component="span" sx={{ marginLeft: 'auto', fontWeight: 'bold' }}>
              {`$${balances[account.name] || 'N/A'}`}
            </Box>
          </MenuItem>
        ))}
      </Select>
    </Box>
  );
};

export default AccountSelector;
