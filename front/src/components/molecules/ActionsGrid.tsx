import React, { useEffect, useState } from 'react';
import { useSetupsContext } from '../../containers/SetupsContext';
import { Setup } from '../../types/setup.types';
import {
    DataGrid,
    GridActionsCellItem,
    GridCellParams,
    GridRow,
    GridRowId,
    GridRowProps,
} from '@mui/x-data-grid';
import { Button, Typography } from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import PauseIcon from '@mui/icons-material/Pause';
import ClearIcon from '@mui/icons-material/Clear';
import ArrowDownwardIcon from '@mui/icons-material/ArrowDownward';
import ArrowUpwardIcon from '@mui/icons-material/ArrowUpward';
import AddIcon from '@mui/icons-material/Add';
import Paper from '../atoms/Paper';
import Title from '../atoms/Title';
import { Action, ActionType, ValueType } from '../../types/action.types';
import { StatusType, TriggerType } from '../../types/common.types';
import { useActionsContext } from '../../containers/ActionsContext';
import { mapColorStatus } from '../../utils/common.utils';
import { TriggerOptions } from '../../utils/trigger.utils';

interface ActionsGridProps {
    setup: Setup;
    updateSelectedSetup: (setup: Setup | undefined) => void;
}

const ActionsGrid: React.FC<ActionsGridProps> = ({ setup, updateSelectedSetup }) => {
    const { updateSetup, setups } = useSetupsContext();
    const { createAction, updateAction, deleteAction } = useActionsContext();
    const [rows, setRows] = useState<Action[]>([]);

    useEffect(() => {
        setRows([...setup.actions].sort((a, b) => a.order - b.order));
        // console.log(setup.actions)
    }, [setup.actions]);

    const handleRowUpdate = async (newAction: Action, oldAction: Action) => {
        if (oldAction.id) {
            const updatedActions = setup.actions.map((action) =>
                action.id === oldAction.id ? newAction : action,
            );

            if (setup.id) {
                await updateAction(oldAction.id, newAction)
                // setRows(updatedActions);
                updateSelectedSetup({ ...setup, actions: updatedActions })
            }
        }
        return newAction;
    };

    const handleClickDeleteAction = async (id: any) => {
        const updatedActions = rows.filter((row) => row.id !== id);
        if (setup.id) {
            const updatedSetup = { ...setup, actions: updatedActions };
            await deleteAction(id)
            // setRows(updatedActions);
            updateSelectedSetup(updatedSetup)
        }
    };

    const handleClickPauseAction = async (action: Action) => {
        const actionToUpdate = { ...action, status: StatusType.PAUSED };
        if (action.id) {
            await updateAction(action.id, actionToUpdate);
            if (setup.id) {
                const updatedActions = setup.actions.map(a =>
                    a.id === action.id ? actionToUpdate : a
                );
                const updatedSetup = { ...setup, actions: updatedActions };
                // setRows(updatedActions);
                updateSelectedSetup(updatedSetup)
            }
        }
    }

    const handleClickPlayAction = async (action: Action) => {
        const actionToUpdate = { ...action, status: StatusType.PENDING };
        if (action.id) {
            const updatedActions = setup.actions.map(a =>
                a.id === action.id ? actionToUpdate : a
            );
            if (setup.id) {
                const updatedSetup = { ...setup, actions: updatedActions };
                await updateSetup(setup.id, updatedSetup);
                // setRows(updatedActions);
                updateSelectedSetup(updatedSetup)
            }
        }
    }


    const handleClickMoveAction = async (id: any, direction: 'up' | 'down') => {
        let movedActions = [...setup.actions];
        const actionIndex = movedActions.findIndex(action => action.id === id);

        if (direction === 'up' && actionIndex > 0) {
            [movedActions[actionIndex - 1], movedActions[actionIndex]] = [movedActions[actionIndex], movedActions[actionIndex - 1]];
        } else if (direction === 'down' && actionIndex < movedActions.length - 1) {
            [movedActions[actionIndex + 1], movedActions[actionIndex]] = [movedActions[actionIndex], movedActions[actionIndex + 1]];
        }

        movedActions = movedActions.map((action, index) => ({ ...action, order: index }));

        console.log("movedActions", movedActions)

        if (setup.id) {
            const updatedSetup = { ...setup, actions: movedActions };
            await updateSetup(setup.id, updatedSetup);
            //     // setRows(movedActions);
            updateSelectedSetup(updatedSetup)
        }
    };

    const handleAddAction = async () => {
        if (setup.id) {
            const newAction: Action = {
                type: ActionType.MARKET_LONG,
                trigger: TriggerType.NONE,
                value: '0',
                value_type: ValueType.CONTRACTS,
                status: StatusType.PAUSED,
                order: rows.length,
            };

            const createdAction = await createAction(setup.id, newAction);
            if (createdAction) {
                const updatedActions = [...setup.actions, createdAction];
                // setRows(updatedActions);
                const updatedSetup = { ...setup, actions: updatedActions };
                updateSelectedSetup(updatedSetup);
                console.log("handleAddAction", createdAction, updatedSetup)
            }
        }
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
        {
            field: 'type', headerName: 'Type', flex: 1, editable: true,
            type: 'singleSelect',
            valueOptions: Object.values(ActionType),
        },
        {
            field: 'trigger',
            headerName: 'Trigger',
            flex: 1,
            editable: true,
            type: 'singleSelect',
            valueOptions: TriggerOptions,
        },
        { field: 'value', headerName: 'Value', flex: 1, editable: true },
        {
            field: 'status',
            headerName: 'Status',
            flex: 1,
            renderCell: renderStatusCell,
        },
        {
            field: 'actions',
            headerName: 'Actions',
            sortable: false,
            type: 'actions',
            flex: 1,
            getActions: ({ id, row }: { id: GridRowId, row: any }) => {
                const actionItems = [];
                const actionIndex = rows.findIndex((row) => row.id === id);
                const isFirst = actionIndex === 0;
                const isLast = actionIndex === rows.length - 1;
                const isEditable = ![StatusType.DONE, StatusType.ACTIVE].includes(row.status);

                if (isEditable && row.status === StatusType.PAUSED) {
                    actionItems.push(
                        <GridActionsCellItem
                            icon={<PlayArrowIcon />}
                            label="Play"
                            onClick={() => handleClickPlayAction(row)}
                            color="primary"
                        />
                    );
                } else if (isEditable) {
                    actionItems.push(
                        <GridActionsCellItem
                            icon={<PauseIcon />}
                            label="Pause"
                            onClick={() => handleClickPauseAction(row)}
                            color="primary"
                        />
                    );
                }

                if (!isFirst) {
                    actionItems.push(
                        <GridActionsCellItem
                            icon={<ArrowUpwardIcon />}
                            label="Increase order priority"
                            onClick={() => handleClickMoveAction(id, 'up')}
                            color="primary"
                        />,
                    );
                }

                if (!isLast) {
                    actionItems.push(
                        <GridActionsCellItem
                            icon={<ArrowDownwardIcon />}
                            label="Decrease order priority"
                            onClick={() => handleClickMoveAction(id, 'down')}
                            color="primary"
                        />,
                    );
                }

                actionItems.push(
                    <GridActionsCellItem
                        icon={<ClearIcon />}
                        label="Delete"
                        onClick={() => handleClickDeleteAction(id)}
                        color="error"
                    />,
                );

                return actionItems;
            },
        },
    ];

    return (
        <Paper>
            <Title>Actions</Title>
            <DataGrid
                rows={rows}
                columns={columns}
                processRowUpdate={handleRowUpdate}
                columnHeaderHeight={42}
                rowHeight={32}
            />
            <Button
                variant="outlined"
                startIcon={<AddIcon />}
                onClick={handleAddAction}
                style={{ margin: '10px 0' }}
            >
                Add Action
            </Button>
        </Paper>
    );
};
export default ActionsGrid;
