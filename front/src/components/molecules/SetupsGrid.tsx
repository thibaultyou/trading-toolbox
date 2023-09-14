import React, { useEffect, useState } from 'react';
import { Typography } from '@mui/material';
import {
  DataGrid,
  GridActionsCellItem,
  GridCellParams,
  GridRowId,
} from '@mui/x-data-grid';
import ClearIcon from '@mui/icons-material/Clear';
import isEqual from 'lodash.isequal';
import { useSetupsContext } from '../../containers/SetupsContext';
import ActionsGrid from './ActionsGrid';
import { Setup } from '../../types/setup.types';
import { StatusType } from '../../types/common.types';
import { GridInitialStateCommunity } from '@mui/x-data-grid/models/gridStateCommunity';
import Title from '../atoms/Title';
import Paper from '../atoms/Paper';
import PauseIcon from '@mui/icons-material/Pause';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import TradingViewChart from './TradingViewChart';
import { mapColorStatus } from '../../utils/common.utils';
import { TriggerOptions } from '../../utils/trigger.utils';

const SetupsGrid: React.FC = () => {
  const { updateSetup, deleteSetup, setups } = useSetupsContext();
  const [selectedSetup, setSelectedSetup] = useState<Setup>();

  const [rows, setRows] = useState<Setup[]>(setups);

  useEffect(() => {
    setRows(setups);
  }, [selectedSetup, setups]);

  const handleDeleteClick = async (id: GridRowId) => {
    await deleteSetup(id.toString());
    if (selectedSetup && selectedSetup.id === id) {
      setSelectedSetup(undefined);
    }
  };

  const processRowUpdate = async (newSetup: Setup, oldSetup: Setup) => {
    console.log("processRowUpdate")
    if (!isEqual(oldSetup, newSetup) && newSetup.id) {
      await updateSetup(newSetup.id, newSetup);
      setSelectedSetup(newSetup);
    }
    return newSetup;
  };

  const handleRowClick = (params: any) => {
    console.log("handleRowClick", params)
    setSelectedSetup(params.row);
  };

  const handlePauseClick = async (id: GridRowId) => {
    const setupToPause = setups.find((setup) => setup.id === id);
    if (!setupToPause) {
      console.warn(`No setup found with ID ${id}`);
      return;
    }
    const pausedSetup = {
      ...setupToPause,
      status: StatusType.PAUSED,
    };
    await updateSetup(id.toString(), pausedSetup);
  };

  const handlePlayClick = async (id: GridRowId) => {
    const setupToPlay = setups.find((setup) => setup.id === id);
    if (!setupToPlay) {
      console.warn(`No setup found with ID ${id}`);
      return;
    }
    const playSetup = {
      ...setupToPlay,
      status: StatusType.PENDING,
    };
    await updateSetup(id.toString(), playSetup);
  };

  const renderStatusCell = (params: GridCellParams) => {
    const statusValue = params.value as StatusType;
    return (
      <Typography
        variant="button"
        style={{ color: mapColorStatus[statusValue] }}
      >
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
      valueOptions: TriggerOptions,
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
      field: 'actions',
      headerName: 'Actions',
      sortable: false,
      type: 'actions',
      flex: 1,
      getActions: ({ id, row }: { id: GridRowId; row: any }) => {
        const actions = [];
        const isEditable = ![StatusType.DONE, StatusType.ACTIVE].includes(
          row.status,
        );

        if (isEditable && row.status === StatusType.PAUSED) {
          actions.push(
            <GridActionsCellItem
              icon={<PlayArrowIcon />}
              label="Play"
              onClick={() => handlePlayClick(id)}
              color="primary"
            />,
          );
        } else if (isEditable) {
          actions.push(
            <GridActionsCellItem
              icon={<PauseIcon />}
              label="Pause"
              onClick={() => handlePauseClick(id)}
              color="primary"
            />,
          );
        }

        actions.push(
          <GridActionsCellItem
            icon={<ClearIcon />}
            label="Delete"
            onClick={() => handleDeleteClick(id)}
            color="error"
          />,
        );

        return actions;
      },
    },
  ];

  const initialSorting: GridInitialStateCommunity = {
    sorting: { sortModel: [{ field: 'ticker', sort: 'asc' }] },
  };

  return (
    <>
      {setups.length === 0 ? (
        <Paper>
          <Title>No setups to display.</Title>
        </Paper>
      ) : (
        <>
          <Paper>
            <Title>Setups</Title>
            <DataGrid
              rows={rows}
              columns={columns}
              processRowUpdate={processRowUpdate}
              onRowClick={handleRowClick}
              style={{ width: '100%' }}
              initialState={initialSorting}
              columnHeaderHeight={42}
              rowHeight={32}
            // getRowId={(row) => row.id!!}
            />
          </Paper>
          {selectedSetup && (
            <>
              {/* <TradingViewChart setup={selectedSetup} /> */}
              <ActionsGrid
                setup={selectedSetup}
                updateSelectedSetup={setSelectedSetup}
              />
            </>
          )}
        </>
      )}
    </>
  );
};

export default SetupsGrid;
