import React, { useState } from 'react';
import { Typography } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridCellParams,
  GridRowId,
} from '@mui/x-data-grid';
import DeleteIcon from '@mui/icons-material/Clear';
import isEqual from 'lodash.isequal';
import { useSetupsContext } from '../../containers/SetupsContext';
import ActionTable from './ActionTable';
import { Setup } from '../../types/setup.types';
import { StatusType, TriggerType } from '../../types/common.types';
import { GridInitialStateCommunity } from '@mui/x-data-grid/models/gridStateCommunity';

const colorMap = {
  [StatusType.ACTIVE]: 'red',
  [StatusType.PENDING]: 'green',
  [StatusType.PAUSED]: 'orange',
  [StatusType.DONE]: 'gray',
};

const triggerOptions = Object.values(TriggerType).filter(
  (t) => t !== TriggerType.TRADINGVIEW,
);

const SetupsList: React.FC = () => {
  const { updateSetup, deleteSetup, setups } = useSetupsContext();
  const [selectedSetup, setSelectedSetup] = useState<Setup>();

  const handleDeleteClick = (id: GridRowId) => {
    deleteSetup(id.toString());
  };

  const processRowUpdate = async (newSetup: Setup, oldSetup: Setup) => {
    if (!isEqual(oldSetup, newSetup) && newSetup.id) {
      updateSetup(newSetup.id.toString(), newSetup);
    }
    return newSetup;
  };

  const handleRowClick = (params: any) => {
    setSelectedSetup(params.row);
  };

  const renderStatusCell = (params: GridCellParams) => {
    const statusValue = params.value as StatusType;
    return (
      <Typography style={{ color: colorMap[statusValue] }}>
        {statusValue}
      </Typography>
    );
  };

  const columns = [
    { field: 'account', headerName: 'Account', editable: false, flex: 1 },
    { field: 'ticker', headerName: 'Ticker', editable: false, flex: 1 },
    {
      field: 'trigger',
      headerName: 'Trigger',
      editable: true,
      type: 'singleSelect',
      flex: 1,
      valueOptions: triggerOptions,
    },
    {
      field: 'retries',
      headerName: 'Retries',
      editable: true,
      type: 'number',
      flex: 1,
    },
    { field: 'value', headerName: 'Value', editable: true, flex: 1 },
    {
      field: 'status',
      headerName: 'Status',
      editable: false,
      flex: 1,
      renderCell: renderStatusCell,
    },
    {
      field: 'edit',
      headerName: 'Edit',
      type: 'actions',
      flex: 1,
      getActions: ({ id }: { id: GridRowId }) => [
        <GridActionsCellItem
          icon={<DeleteIcon />}
          label="Delete"
          onClick={() => handleDeleteClick(id)}
          color="error"
        />,
      ],
    },
  ];

  const initialSorting: GridInitialStateCommunity = {
    sorting: { sortModel: [{ field: 'ticker', sort: 'asc' }] },
  };

  if (setups.length === 0) {
    return <Typography variant="h6">No setups to display.</Typography>;
  }

  return (
    <>
      <DataGrid
        rows={setups}
        columns={columns}
        processRowUpdate={processRowUpdate}
        onRowClick={handleRowClick}
        style={{ width: '100%' }}
        initialState={initialSorting}
      />
      {selectedSetup && <ActionTable actions={selectedSetup.actions} />}
    </>
  );
};

export default SetupsList;
