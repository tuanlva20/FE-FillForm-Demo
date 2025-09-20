import { Alert, Box, Paper, Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Typography } from '@mui/material';
import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import CustomPercentTextField from './CustomPercentTextField';

interface Option {
  id: string;
  text: string;
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

const MultipleChoiceGridPercentInput: React.FC<Props> = React.memo(({ question, onChange, value }) => {
  // Phân tích row & column - memoized để tránh recalculate
  const { rows, columns } = useMemo(() => {
    // Filter rows based on value pattern "row_X" or text pattern "Row X"
    const rows = (question.options || []).filter((opt) => 
      (opt.value && opt.value.startsWith('row_')) || 
      (opt.text && opt.text.toLowerCase().startsWith('row'))
    );
    const seen = new Set();
    const columns = (question.options || []).filter(
      (opt) => !opt.value?.startsWith('row_') && !opt.text?.toLowerCase().startsWith('row') && !seen.has(opt.value) && seen.add(opt.value)
    );
    return { rows, columns };
  }, [question.options]);

  // State lưu giá trị: {rowValue: {colValue: percent}}
  const [values, setValues] = useState<Record<string, Record<string, number>>>({});
  // State lưu lỗi tổng phần trăm
  const [rowErrors, setRowErrors] = useState<Record<string, boolean>>({});

  // Refs for optimization
  const onChangeRef = useRef(onChange);
  const debounceTimeoutRef = useRef<NodeJS.Timeout>();

  // Update onChange ref without triggering re-renders
  useEffect(() => {
    onChangeRef.current = onChange;
  }, [onChange]);

  // Optimized state sync - only update if values actually changed
  useEffect(() => {
    if (value && JSON.stringify(value) !== JSON.stringify(values)) {
      setValues(value);
    }
  }, [value]); // Removed values dependency to prevent infinite loops

  // Memoized validation function with stable reference
  const validateRow = useCallback(
    (rowValue: string, rowVals: Record<string, number>) => {
      const total = columns.reduce((sum, col) => sum + (Number(rowVals[col.value]) || 0), 0);
      return Math.abs(total - 100) > 0.01; // Use small epsilon for floating point comparison
    },
    [columns]
  );

  // Optimized validation effect with reduced re-renders
  useEffect(() => {
    const errors: Record<string, boolean> = {};
    let hasChanges = false;

    rows.forEach((row) => {
      const rowVals = values[row.value] || {};
      const error = validateRow(row.value, rowVals);
      if (rowErrors[row.value] !== error) {
        hasChanges = true;
      }
      errors[row.value] = error;
    });

    if (hasChanges) {
      setRowErrors(errors);
    }
  }, [values, rows, validateRow]); // Removed rowErrors dependency

  // Optimized input handler without additional debouncing
  const handleInput = useCallback((rowValue: string, colValue: string, percent: number) => {
    setValues((prev) => {
      const next = {
        ...prev,
        [rowValue]: {
          ...prev[rowValue],
          [colValue]: percent
        }
      };

      // Clear previous timeout
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }

      // Single debounce at grid level (CustomPercentTextField already handles input debouncing)
      debounceTimeoutRef.current = setTimeout(() => {
        onChangeRef.current?.(next);
      }, 50); // Reduced timeout since CustomPercentTextField already debounces

      return next;
    });
  }, []); // Empty dependency array since we use refs

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (debounceTimeoutRef.current) {
        clearTimeout(debounceTimeoutRef.current);
      }
    };
  }, []);

  // Memoized row totals calculation
  const rowTotals = useMemo(() => {
    const totals: Record<string, number> = {};
    rows.forEach((row) => {
      const rowVals = values[row.value] || {};
      totals[row.value] = columns.reduce((sum, col) => sum + (Number(rowVals[col.value]) || 0), 0);
    });
    return totals;
  }, [values, rows, columns]);

  if (question.type !== 'multiple_choice_grid') return null;

  return (
    <Box>
      <TableContainer 
        component={Paper}
        sx={{
          maxHeight: 600,
          overflowX: 'auto',
          overflowY: 'auto',
          position: 'relative',
          // Ensure proper stacking context for sticky elements
          isolation: 'isolate',
          '&::-webkit-scrollbar': {
            height: 8,
            width: 8
          },
          '&::-webkit-scrollbar-track': {
            backgroundColor: 'rgba(0,0,0,0.1)',
            borderRadius: 4
          },
          '&::-webkit-scrollbar-thumb': {
            backgroundColor: 'rgba(0,0,0,0.3)',
            borderRadius: 4,
            '&:hover': {
              backgroundColor: 'rgba(0,0,0,0.5)'
            }
          }
        }}
      >
        <Table size="small" sx={{ 
          minWidth: Math.max(800, columns.length * 120 + 400),
          '& .MuiTableCell-root': {
            borderRight: '1px solid',
            borderColor: 'divider',
            '&:last-child': {
              borderRight: 'none'
            }
          }
        }}>
          <TableHead>
            <TableRow>
              <TableCell 
                sx={{ 
                  minWidth: 150, 
                  maxWidth: 500,
                  // position: 'sticky',
                  left: 0,
                  backgroundColor: 'background.paper',
                  zIndex: 11,
                  borderRight: '2px solid',
                  borderColor: 'divider',
                  boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
                  // Ensure proper sticky behavior
                  willChange: 'transform',
                  // Force hardware acceleration for better performance
                  transform: 'translateZ(0)',
                  // Ensure background is opaque
                  '&::before': {
                    content: '""',
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    backgroundColor: 'background.paper',
                    zIndex: -1
                  }
                }}
              >
                <Typography variant="subtitle2" fontWeight={600}>
                  Câu hỏi
                </Typography>
              </TableCell>
              {columns.map((col) => (
                <TableCell 
                  key={col.value} 
                  align="center"
                  sx={{ 
                    minWidth: 120,
                    maxWidth: 140,
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis'
                  }}
                >
                  <Typography variant="subtitle2" fontWeight={600} noWrap>
                    {col.text}
                  </Typography>
                </TableCell>
              ))}
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row) => {
              const total = rowTotals[row.value];
              const hasError = rowErrors[row.value];

              return (
                <TableRow key={row.value} hover>
                  <TableCell 
                    sx={{ 
                      minWidth: 350, 
                      maxWidth: 500,
                      // position: 'sticky',
                      left: 0,
                      backgroundColor: 'background.paper',
                      zIndex: 11,
                      borderRight: '2px solid',
                      borderColor: 'divider',
                      boxShadow: '2px 0 4px rgba(0,0,0,0.1)',
                      // Ensure proper sticky behavior
                      willChange: 'transform',
                      // Force hardware acceleration for better performance
                      transform: 'translateZ(0)',
                      // Ensure background is opaque
                      '&::before': {
                        content: '""',
                        position: 'absolute',
                        top: 0,
                        left: 0,
                        right: 0,
                        bottom: 0,
                        backgroundColor: 'background.paper',
                        zIndex: -1
                      }
                    }}
                  >
                    <Typography variant="body2" fontWeight={500} sx={{ lineHeight: 1.4 }}>
                      {row.text}
                    </Typography>
                    {hasError && (
                      <Typography color="error" variant="caption" display="block" sx={{ mt: 0.5 }}>
                        Tổng hiện tại: {total}%
                      </Typography>
                    )}
                  </TableCell>
                  {columns.map((col) => (
                    <TableCell 
                      key={col.value} 
                      align="center"
                      sx={{ 
                        minWidth: 120,
                        maxWidth: 140,
                        padding: '8px'
                      }}
                    >
                      <CustomPercentTextField
                        value={values[row.value]?.[col.value] ?? ''}
                        onChange={(val) => handleInput(row.value, col.value, val)}
                        error={hasError}
                        sx={{
                          width: '100%',
                          maxWidth: '120px'
                        }}
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

MultipleChoiceGridPercentInput.displayName = 'MultipleChoiceGridPercentInput';

export default MultipleChoiceGridPercentInput;
