import { Box, Typography, Slider } from '@mui/material';
import { useSetupFormContext } from '../../../containers/SetupFormContext';

const RETRIES_MARKS = [
  { value: 0, label: '0' },
  { value: 1, label: '1' },
  { value: 2, label: '2' },
  { value: 3, label: '3' },
  { value: 4, label: '4' },
  { value: 5, label: '5' },
];

const RetriesSlider: React.FC = () => {
  const { setup, setSetup } = useSetupFormContext();
  const handleRetriesChange = (_: Event, targetValue: number | number[]) =>
    setSetup({ ...setup, retries: Number(targetValue) });

  return (
    <Box sx={{ mt: 1 }}>
      <Typography sx={{ mb: 1 }}>Retries</Typography>
      <Slider
        aria-label="Retries"
        defaultValue={3}
        step={1}
        onChange={handleRetriesChange}
        marks={RETRIES_MARKS}
        min={0}
        max={5}
      />
    </Box>
  );
};

export default RetriesSlider;
