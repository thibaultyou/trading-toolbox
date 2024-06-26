import { Box, Typography, Autocomplete, TextField } from '@mui/material';
import { useSetupFormContext } from '../../../containers/SetupFormContext';
import { useTickersContext } from '../../../containers/TickersContext';

const TickerSelector: React.FC = () => {
  const { tickers } = useTickersContext();
  const { setup, setSetup } = useSetupFormContext();
  const handleTickerChange = (e: React.ChangeEvent<HTMLInputElement>) =>
    setSetup({ ...setup, ticker: e.target.value });

  return (
    <Box sx={{ mt: 1 }}>
      <Typography sx={{ mb: 1 }}>Ticker</Typography>
      <Autocomplete
        id="ticker"
        options={tickers}
        groupBy={(option) => option[0]}
        getOptionLabel={(option) => option}
        fullWidth
        value={setup.ticker}
        disableClearable
        renderInput={(params) => (
          <TextField
            {...params}
            onChange={handleTickerChange}
            onSelect={handleTickerChange}
          />
        )}
      />
    </Box>
  );
};

export default TickerSelector;
