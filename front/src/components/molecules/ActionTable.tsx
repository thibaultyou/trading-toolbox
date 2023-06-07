import React from 'react';
import { Setup } from '../../types/setup.types';
import {
  Table,
  TableBody,
  TableRow,
  TableCell,
  TableHead,
  Typography,
} from '@mui/material';

interface ActionTableProps {
  actions: Setup['actions'];
}

const ActionTable: React.FC<ActionTableProps> = ({ actions }) => (
  <>
    <Typography variant="h6" gutterBottom align="left" sx={{ mt: 2 }}>
      Actions
    </Typography>
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell align="left">Type</TableCell>
          <TableCell align="left">Trigger</TableCell>
          <TableCell align="left">Value</TableCell>
          <TableCell align="left">Status</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {actions.map((action, actionIndex) => (
          <TableRow key={actionIndex}>
            <TableCell align="left">{action.type}</TableCell>
            <TableCell align="left">{action.trigger}</TableCell>
            <TableCell align="left">{action.value}</TableCell>
            <TableCell align="left">{action.status}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </>
);

export default ActionTable;
