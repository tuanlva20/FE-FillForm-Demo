
// material-ui
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Typography from '@mui/material/Typography';

// icons
import { ArrowRight2 } from 'iconsax-react';

// types
import { Question } from 'api/form';

interface GridQuestionMappingProps {
  question: Question;
  sheetColumns: string[];
  columnMappings: Map<string, string>;
  onMappingChange: (questionId: string, rowTitle: string | null, columnIndex: number) => void;
}

export default function GridQuestionMapping({ question, sheetColumns, columnMappings, onMappingChange }: GridQuestionMappingProps) {
  const rows = (question.options || [])
    .filter((opt: any) => opt?.value && String(opt.value).startsWith('row'))
    .sort((a: any, b: any) => a.position - b.position);

  const getSelectedIndex = (rowText: string): number => {
    const mappedName = columnMappings.get(`${question.id}:${rowText}`) || '';
    const idx = sheetColumns.findIndex((c) => c === mappedName);
    return idx >= 0 ? idx : -1;
  };

  return (
    <Box sx={{ mt: 2 }}>
      {/* Top line above the title */}
      <Box sx={{ borderTop: '2px solid', borderColor: 'divider' }} />

      {/* Spacing between line and content */}
      <Box sx={{ pt: 2 }} />

      <Typography variant="subtitle1" fontWeight={600} sx={{ mb: 1.5 }}>
        {question.title}
        {question.required && (
          <Typography component="span" sx={{ color: 'error.main', ml: 0.5 }}>
            *
          </Typography>
        )}
      </Typography>

      {rows.map((row: any) => (
        <Grid key={`${question.id}:${row.text}`} container spacing={2} alignItems="center" sx={{ mb: 1 }}>
          <Grid size={{ xs: 5, md: 5 }}>
            <Typography fontWeight={500} color="text.secondary">
              {row.text}
            </Typography>
          </Grid>
          <Grid size={{ xs: 1, md: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
            <ArrowRight2 size={20} />
          </Grid>
          <Grid size={{ xs: 6, md: 6 }}>
            <FormControl fullWidth>
              <Select
                value={getSelectedIndex(row.text)}
                onChange={(e) => onMappingChange(question.id, row.text, Number(e.target.value))}
                displayEmpty
                size="small"
              >
                <MenuItem value={-1}>
                  - Chọn cột dữ liệu liên kết -
                </MenuItem>
                {sheetColumns.map((column, idx) => (
                  <MenuItem key={`${question.id}:${row.text}:${column}`} value={idx}>
                    {column}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
        </Grid>
      ))}
      {/* Spacing between content and line */}
      <Box sx={{ pb: 2 }} />
      {/* Bottom line below the grid question */}
      <Box sx={{ borderBottom: '2px solid', borderColor: 'divider' }} />
    </Box>
  );
}


