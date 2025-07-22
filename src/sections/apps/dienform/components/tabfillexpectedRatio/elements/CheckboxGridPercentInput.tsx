import { Alert, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import CustomPercentTextField from './CustomPercentTextField';

interface Option {
  id: string;
  title: string;
  value: string;
}
interface Question {
  id: string;
  title: string;
  options: Option[];
  type: string;
}

interface Props {
  question: Question;
  onChange?: (value: Record<string, Record<string, number>>) => void;
  value?: Record<string, Record<string, number>>;
}

const CheckboxGridPercentInput: React.FC<Props> = ({ question, onChange, value }) => {
  // Rows: options with value starting with 'row'
  const rows = (question.options || []).filter(opt => opt.value && opt.value.startsWith('row'));
  // Columns: unique options with value not starting with 'row'
  const seen = new Set();
  const columns = (question.options || [])
    .filter(opt => opt.value && !opt.value.startsWith('row') && !seen.has(opt.value) && seen.add(opt.value));

  // State lưu giá trị: {rowId: {colId: percent}}
  const [values, setValues] = useState<Record<string, Record<string, number>>>({});
  // State lưu lỗi tổng phần trăm
  const [rowErrors, setRowErrors] = useState<Record<string, boolean>>({});

  // Đồng bộ state khi prop value thay đổi
  React.useEffect(() => {
    if (value) setValues(value);
  }, [value]);

  useEffect(() => {
    // Validate tổng phần trăm mỗi row
    const errors: Record<string, boolean> = {};
    let changed = false;
    rows.forEach(row => {
      const rowVals = values[row.id] || {};
      const total = columns.reduce((sum, col) => sum + (Number(rowVals[col.id]) || 0), 0);
      const error = total !== 100;
      if (rowErrors[row.id] !== error) changed = true;
      errors[row.id] = error;
    });
    if (changed) setRowErrors(errors);
    // eslint-disable-next-line
  }, [values, rows, columns]);

  const handleInput = (rowId: string, colId: string, percent: number) => {
    setValues(prev => {
      const next = { ...prev, [rowId]: { ...prev[rowId], [colId]: percent } };
      onChange?.(next);
      return next;
    });
  };

  if (question.type !== 'checkbox_grid') return null;

  return (
    <Box>
      <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              {columns.map(col => (
                <TableCell key={col.id} align="center">{col.title}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => {
              const total = columns.reduce((sum, col) => sum + (Number(values[row.id]?.[col.id]) || 0), 0);
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.title}
                    {rowErrors[row.id] && (
                      <Typography color="error" variant="caption" display="block">
                        Tổng hiện tại: {columns.reduce((sum, col) => sum + (Number(values[row.id]?.[col.id]) || 0), 0)}%
                      </Typography>
                    )}
                  </TableCell>
                  {columns.map(col => (
                    <TableCell key={col.id} align="center">
                      <CustomPercentTextField
                        value={values[row.id]?.[col.id] ?? ''}
                        onChange={val => handleInput(row.id, col.id, val)}
                        error={rowErrors[row.id]}
                      />
                    </TableCell>
                  ))}
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </TableContainer>
      {Object.values(rowErrors).some(Boolean) && (
        <Alert severity="error" sx={{ mt: 2 }}>Tổng nên = 100%</Alert>
      )}
    </Box>
  );
};

export default CheckboxGridPercentInput; 