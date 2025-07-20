
// material-ui
import Box from '@mui/material/Box';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Paper from '@mui/material/Paper';
import Select from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Typography from '@mui/material/Typography';
import { alpha, useTheme } from '@mui/material/styles';

// project imports
interface DataMappingResponse {
  questions: Array<{
    id: string;
    title: string;
    type: string;
    required?: boolean;
  }>;
  sheetColumns: string[];
  sampleRows: any[][];
  errors?: string[];
  unmappedQuestions?: string[];
  autoMappings?: Array<{
    questionId: string;
    columnName: string;
  }>;
}

interface DataMappingFormProps {
  question: {
    id: string;
    title: string;
    type: string;
    options?: {
      title: string;
      subOptions?: {
        title: string;
      }[];
    }[];
  };
  mappingData: DataMappingResponse & {
    headers: string[];
    columnMappings: Map<string, string>;
  };
  onMappingChange: (questionId: string, rowTitle: string | null, columnIndex: number) => void;
}

const DataMappingForm = ({ question, mappingData, onMappingChange }: DataMappingFormProps) => {
  const theme = useTheme();

  const isGridQuestion = question.type === 'multiple_choice_grid' || question.type === 'checkbox_grid';
  const isDateTimeQuestion = question.type === 'date' || question.type === 'time';

  // Helper function to get column index from column name
  const getColumnIndex = (columnName: string): number => {
    return mappingData.headers.findIndex(header => header === columnName);
  };

  return (
    <Box sx={{ width: '100%', mb: 3 }}>
      <Typography variant="h6" gutterBottom>
        {question.title}
      </Typography>

      {isGridQuestion ? (
        <TableContainer 
          component={Paper} 
          sx={{ 
            borderRadius: 2,
            boxShadow: theme.customShadows.z1,
            '& .MuiTableCell-root': {
              borderColor: theme.palette.divider
            }
          }}
        >
          <Table>
            <TableHead>
              <TableRow
                sx={{
                  backgroundColor: alpha(theme.palette.primary.main, 0.05),
                  '& .MuiTableCell-head': {
                    color: theme.palette.text.primary,
                    fontWeight: 600
                  }
                }}
              >
                <TableCell>Thời gian</TableCell>
                <TableCell>Cột dữ liệu</TableCell>
                <TableCell>Dữ liệu mẫu</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {question.options?.map((row) => (
                <TableRow key={row.title}>
                  <TableCell component="th" scope="row" sx={{ fontWeight: 500 }}>
                    {row.title}
                  </TableCell>
                  <TableCell>
                    <FormControl fullWidth size="small">
                      <Select
                        value={getColumnIndex(mappingData.columnMappings.get(`${question.id}:${row.title}`) || '')}
                        onChange={(e) => onMappingChange(question.id, row.title, Number(e.target.value))}
                        displayEmpty
                      >
                        <MenuItem value={-1}>
                          <em>- Chọn cột -</em>
                        </MenuItem>
                        {mappingData.headers.map((header, index) => (
                          <MenuItem key={index} value={index}>
                            {header}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </TableCell>
                  <TableCell>
                    {mappingData.sampleRows[0]?.[getColumnIndex(mappingData.columnMappings.get(`${question.id}:${row.title}`) || '')]}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      ) : isDateTimeQuestion ? (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Cột dữ liệu</InputLabel>
              <Select
                value={getColumnIndex(mappingData.columnMappings.get(question.id) || '')}
                onChange={(e) => onMappingChange(question.id, null, Number(e.target.value))}
                label="Cột dữ liệu"
                displayEmpty
              >
                <MenuItem value={-1}>
                  <em>- Chọn cột -</em>
                </MenuItem>
                {mappingData.headers.map((header, index) => (
                  <MenuItem key={index} value={index}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Dữ liệu mẫu:
            </Typography>
            <Typography variant="body2">
              {mappingData.sampleRows[0]?.[getColumnIndex(mappingData.columnMappings.get(question.id) || '')]}
            </Typography>
            <Typography variant="caption" color="textSecondary" sx={{ display: 'block', mt: 1 }}>
              {question.type === 'date' ? 'Định dạng ngày: YYYY-MM-DD' : 'Định dạng giờ: HH:mm hoặc hh:mm AM/PM'}
            </Typography>
          </Grid>
        </Grid>
      ) : (
        <Grid container spacing={2}>
          <Grid item xs={12} sm={6}>
            <FormControl fullWidth>
              <InputLabel>Cột dữ liệu</InputLabel>
              <Select
                value={getColumnIndex(mappingData.columnMappings.get(question.id) || '')}
                onChange={(e) => onMappingChange(question.id, null, Number(e.target.value))}
                label="Cột dữ liệu"
                displayEmpty
              >
                <MenuItem value={-1}>
                  <em>- Chọn cột -</em>
                </MenuItem>
                {mappingData.headers.map((header, index) => (
                  <MenuItem key={index} value={index}>
                    {header}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} sm={6}>
            <Typography variant="subtitle2" gutterBottom>
              Dữ liệu mẫu:
            </Typography>
            <Typography variant="body2">
              {mappingData.sampleRows[0]?.[getColumnIndex(mappingData.columnMappings.get(question.id) || '')]}
            </Typography>
          </Grid>
        </Grid>
      )}
    </Box>
  );
};

export default DataMappingForm; 