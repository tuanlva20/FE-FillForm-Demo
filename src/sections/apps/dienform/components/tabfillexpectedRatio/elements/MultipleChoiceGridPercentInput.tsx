import { Alert, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useEffect, useState } from 'react';
import CustomPercentTextField from './CustomPercentTextField';

interface Option {
  id: string;
  text: string;
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

const MultipleChoiceGridPercentInput: React.FC<Props> = ({ question, onChange, value }) => {
  // Phân tích row & column
  const rows = (question.options || []).filter(opt => opt.value && opt.value.startsWith('row'));
  // Loại bỏ value trùng ở column
  const seen = new Set();
  const columns = (question.options || [])
    .filter(opt => opt.value && !opt.value.startsWith('row') && !seen.has(opt.value) && seen.add(opt.value));

  // State lưu giá trị: {rowValue: {colValue: percent}}
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
      const rowVals = values[row.value] || {};
      const total = columns.reduce((sum, col) => sum + (Number(rowVals[col.value]) || 0), 0);
      const error = total !== 100;
      if (rowErrors[row.value] !== error) changed = true;
      errors[row.value] = error;
    });
    if (changed) setRowErrors(errors);
    // eslint-disable-next-line
  }, [values, rows, columns]);

  const handleInput = (rowValue: string, colValue: string, percent: number) => {
    setValues(prev => {
      const next = { ...prev, [rowValue]: { ...prev[rowValue], [colValue]: percent } };
      onChange?.(next);
      return next;
    });
  };

  if (question.type !== 'multiple_choice_grid') return null;

  return (
    <Box>
      <TableContainer component={Paper} sx={{ maxWidth: '100%', overflowX: 'auto' }}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell />
              {columns.map(col => (
                <TableCell key={col.value} align="center">{col.text}</TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map(row => {
              const total = columns.reduce((sum, col) => sum + (Number(values[row.value]?.[col.value]) || 0), 0);
              return (
                <TableRow key={row.value}>
                  <TableCell>
                    {row.text}
                    {rowErrors[row.value] && (
                      <Typography color="error" variant="caption" display="block">
                        Tổng hiện tại: {columns.reduce((sum, col) => sum + (Number(values[row.value]?.[col.value]) || 0), 0)}%
                      </Typography>
                    )}
                  </TableCell>
                  {columns.map(col => (
                    <TableCell key={col.value} align="center">
                      <CustomPercentTextField
                        value={values[row.value]?.[col.value] ?? ''}
                        onChange={val => handleInput(row.value, col.value, val)}
                        error={rowErrors[row.value]}
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
        <Alert severity="error" sx={{ mt: 2 }}>Tổng tỉ lệ nên = 100%</Alert>
      )}
    </Box>
  );
};

export default MultipleChoiceGridPercentInput; 