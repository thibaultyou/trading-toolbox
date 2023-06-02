import React, { useEffect, useState } from 'react';
import { Setup } from '../../types/setup.types';
import { TableContainer, Table, TableBody, TableRow, TableCell, IconButton, TableHead, Collapse, Button, Paper, Typography, Box } from '@mui/material';
import { KeyboardArrowDown, KeyboardArrowUp } from '@mui/icons-material';
import { useSetupsContext } from '../../containers/SetupsContext';
import ClearIcon from '@mui/icons-material/Clear';
import EditIcon from '@mui/icons-material/Edit';

interface Row {
  setup: Setup;
  open: boolean;
}

const RowContent = ({ setup }: { setup: Setup }) => (
  <>
    <TableCell align="center">{setup.account}</TableCell>
    <TableCell align="center">{setup.ticker}</TableCell>
    <TableCell align="center">{setup.trigger}</TableCell>
    <TableCell align="center">{setup.retries}</TableCell>
    <TableCell align="center">{setup.status}</TableCell>
  </>
);

const ActionTable = ({ actions }: { actions: Setup['actions'] }) => (
  <Table size="small">
    <TableHead>
      <TableRow>
        <TableCell>Type</TableCell>
        <TableCell>Trigger</TableCell>
        <TableCell>Value</TableCell>
        <TableCell>Status</TableCell>
      </TableRow>
    </TableHead>
    <TableBody>
      {actions.map((action, actionIndex) => (
        <TableRow key={actionIndex}>
          <TableCell>{action.type}</TableCell>
          <TableCell>{action.trigger}</TableCell>
          <TableCell>{action.value}</TableCell>
          <TableCell>{action.status}</TableCell>
        </TableRow>
      ))}
    </TableBody>
  </Table>
);

const ActionButtons = ({ open, hasActions, toggle, deleteSetup }: { open: boolean, hasActions: boolean, toggle: () => void, deleteSetup: () => void }) => {
  return (
    <>
      <TableCell align="center">
        <Button size="small">
          <EditIcon />
        </Button>
      </TableCell>
      <TableCell align="center">
        <Button color="error" size="small" onClick={deleteSetup}>
          <ClearIcon />
        </Button>
      </TableCell>
      <TableCell align="center">
        {hasActions && (
          <IconButton color="secondary" size="small" onClick={toggle}>
            {open ? <KeyboardArrowUp /> : <KeyboardArrowDown />}
          </IconButton>
        )}
      </TableCell>
    </>
  );
};

const SetupsList: React.FC = () => {
  const { setups, deleteSetup } = useSetupsContext();
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    setRows(setups.map((setup) => ({ setup, open: false })));
  }, [setups])

  const toggleOpen = (index: number) => {
    setRows(
      rows.map((row, i) => (i === index ? { ...row, open: !row.open } : row)),
    );
  };

  if (setups.length === 0) {
    return <Typography variant="h6">No setups to display.</Typography>;
  }

  return (
    <TableContainer>
      <Table size="small">
        <TableHead>
          <TableRow>
            <TableCell align="center">Account</TableCell>
            <TableCell align="center">Ticker</TableCell>
            <TableCell align="center">Trigger</TableCell>
            <TableCell align="center">Retries</TableCell>
            <TableCell align="center">Status</TableCell>
            <TableCell align="center">Edit</TableCell>
            <TableCell align="center">Delete</TableCell>
            <TableCell align="center">Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {rows.map((row, index) => (
            <React.Fragment key={index}>
              <TableRow style={{ height: '48px' }}>
                <RowContent setup={row.setup} />
                <ActionButtons open={row.open} hasActions={row.setup.actions.length !== 0} toggle={() => toggleOpen(index)} deleteSetup={() => row.setup.id ? deleteSetup(row.setup.id) : {}} />
              </TableRow>
              <TableRow>
                <TableCell style={{ padding: 0 }} colSpan={8}>
                  <Collapse in={row.open} timeout="auto" unmountOnExit>
                    <Paper sx={{ p: '10px' }}>
                      <Box display="flex" justifyContent="space-between" alignItems="center">
                        <Typography
                          variant="h6"
                          gutterBottom
                          align="left"
                          sx={{ ml: 2 }}
                        >
                          Actions
                        </Typography>
                        <Typography
                          variant="button"
                          align="right"
                          gutterBottom
                          sx={{ mr: 2 }}
                        >
                          {row.setup.id}
                        </Typography>
                      </Box>
                      <ActionTable actions={row.setup.actions} />
                    </Paper>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
};

export default SetupsList;
