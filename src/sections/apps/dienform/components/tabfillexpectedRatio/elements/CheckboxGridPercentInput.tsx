import { Alert, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useState } from 'react';
import CustomPercentTextField from './CustomPercentTextField';

interface Option {
  id: string;
  title: string;
  value: string;
}

interface Question {
  id: string;
  title: string;
  type: string;
  options: Option[];
}

interface Props {
  question: Question;
  onChange?: (value: Record<string, Record<string, number>>) => void;
  value?: Record<string, Record<string, number>>;
}

const CheckboxGridPercentInput: React.FC<Props> = React.memo(({ question, onChange, value }) => {
  // Rows & Columns - memoized để tránh recalculate
  const { rows, columns } = useMemo(() => {
    const rows = (question.options || []).filter(opt => opt.value && opt.value.startsWith('row'));
    const seen = new Set();
    const columns = (question.options || [])
      .filter(opt => opt.value && !opt.value.startsWith('row') && !seen.has(opt.value) && seen.add(opt.value));
    return { rows, columns };
  }, [question.options]);

  // State lưu giá trị: {rowId: {colId: percent}}
  const [values, setValues] = useState<Record<string, Record<string, number>>>({});
  // State lưu lỗi tổng phần trăm
  const [rowErrors, setRowErrors] = useState<Record<string, boolean>>({});

  // Đồng bộ state khi prop value thay đổi
  useEffect(() => {
    if (value) setValues(value);
  }, [value]);

  // Memoized validation function
  const validateRow = useCallback((rowId: string, rowVals: Record<string, number>) => {
    const total = columns.reduce((sum, col) => sum + (Number(rowVals[col.id]) || 0), 0);
    return total !== 100;
  }, [columns]);

  // Optimized validation effect
  useEffect(() => {
    const errors: Record<string, boolean> = {};
    let hasChanges = false;

    rows.forEach(row => {
      const rowVals = values[row.id] || {};
      const error = validateRow(row.id, rowVals);
      if (rowErrors[row.id] !== error) {
        hasChanges = true;
      }
      errors[row.id] = error;
    });

    if (hasChanges) {
      setRowErrors(errors);
    }
  }, [values, rows, rowErrors, validateRow]);

  // Optimized input handler with debouncing
  const handleInput = useCallback((rowId: string, colId: string, percent: number) => {
    setValues(prev => {
      const next = { 
        ...prev, 
        [rowId]: { 
          ...prev[rowId], 
          [colId]: percent 
        } 
      };
      
      // Debounce the onChange callback to avoid excessive calls
      setTimeout(() => {
        onChange?.(next);
      }, 100);
      
      return next;
    });
  }, [onChange]);

  // Memoized row totals calculation
  const rowTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    rows.forEach(row => {
      const rowVals = values[row.id] || {};
      totals[row.id] = columns.reduce((sum, col) => sum + (Number(rowVals[col.id]) || 0), 0);
    });
    return totals;
  }, [values, rows, columns]);

  if (question.type !== 'checkbox_grid') return null;

  return (
    <Box>
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              {columns.map(col => (
                <TableCell key={col.id} align="center">
                  {col.title}
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => {
              const total = rowTotals[row.id];
              const hasError = rowErrors[row.id];
              
              return (
                <TableRow key={row.id}>
                  <TableCell>
                    {row.title}
                    {hasError && (
                      <Typography color="error" variant="caption" display="block">
                        Tổng hiện tại: {total}%
                      </Typography>
                    )}
                  </TableCell>
                  {columns.map(col => (
                    <TableCell key={col.id} align="center">
                      <CustomPercentTextField
                        value={values[row.id]?.[col.id] ?? ''}
                        onChange={val => handleInput(row.id, col.id, val)}
                        error={hasError}
                        onFocus={e => { if (e.target.value === '0') e.target.value = ''; }}
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
        <Alert severity="error" sx={{ mt: 2 }}>
          Tổng tỉ lệ nên = 100%
        </Alert>
      )}
    </Box>
  );
});

CheckboxGridPercentInput.displayName = 'CheckboxGridPercentInput';

export default CheckboxGridPercentInput; 