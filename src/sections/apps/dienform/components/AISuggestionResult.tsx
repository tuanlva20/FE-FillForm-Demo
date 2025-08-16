// AI Suggestion Result Component
// Hiển thị kết quả AI suggestion với preview và statistics

import BarChartIcon from '@mui/icons-material/BarChart';
import DownloadIcon from '@mui/icons-material/Download';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';
import VisibilityIcon from '@mui/icons-material/Visibility';
import {
    Accordion,
    AccordionDetails,
    AccordionSummary,
    Alert,
    Box,
    Button,
    Checkbox,
    Chip,
    Dialog,
    DialogActions,
    DialogContent,
    DialogTitle,
    IconButton,
    Paper,
    Stack,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TablePagination,
    TableRow,
    ToggleButton,
    ToggleButtonGroup,
    Tooltip,
    Typography
} from '@mui/material';
import { FormDetailResponse } from 'api/form';
import { useState } from 'react';
import { FormSample, SampleStatistics } from 'types/ai-suggestion';

interface AISuggestionResultProps {
  open: boolean;
  onClose: () => void;
  samples: FormSample[];
  statistics: SampleStatistics;
  formData: FormDetailResponse;
  onApplySamples: (samples: FormSample[]) => void;
}

export default function AISuggestionResult({
  open,
  onClose,
  samples,
  statistics,
  formData,
  onApplySamples
}: AISuggestionResultProps) {
  const [selectedSamples, setSelectedSamples] = useState<Set<string>>(new Set());
  const [viewMode, setViewMode] = useState<'table' | 'statistics'>('table');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setSelectedSamples(new Set(samples.map(s => s.sampleId)));
    } else {
      setSelectedSamples(new Set());
    }
  };

  const handleSelectSample = (sampleId: string, checked: boolean) => {
    const newSelected = new Set(selectedSamples);
    if (checked) {
      newSelected.add(sampleId);
    } else {
      newSelected.delete(sampleId);
    }
    setSelectedSamples(newSelected);
  };

  const handleApply = () => {
    const selected = samples.filter(s => selectedSamples.has(s.sampleId));
    onApplySamples(selected);
    onClose();
  };

  const handleDownloadCSV = () => {
    // Tạo CSV từ samples
    const headers = ['Sample ID', ...formData.questions.map(q => q.title)];
    const csvContent = [
      headers.join(','),
      ...samples.map(sample => [
        sample.sampleId,
        ...formData.questions.map(q => {
          const answer = sample.answers.find(a => a.questionId === q.id);
          if (!answer) return '';
          
          if (Array.isArray(answer.answer)) {
            return `"${answer.answer.join('; ')}"`;
          }
          return `"${answer.answer || ''}"`;
        })
      ].join(','))
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ai-samples-${formData.name}-${new Date().toISOString().split('T')[0]}.csv`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const renderAnswer = (answer: any) => {
    if (!answer) return '-';
    
    if (Array.isArray(answer.answer)) {
      return (
        <Stack direction="row" spacing={0.5} flexWrap="wrap" useFlexGap>
          {answer.answer.slice(0, 3).map((item: string, idx: number) => (
            <Chip key={idx} label={item} size="small" variant="outlined" />
          ))}
          {answer.answer.length > 3 && (
            <Chip label={`+${answer.answer.length - 3}`} size="small" variant="outlined" />
          )}
        </Stack>
      );
    }
    
    if (answer.answerAttribute?.otherText) {
      return (
        <Box>
          <Typography variant="body2">{answer.answer}</Typography>
          <Typography variant="caption" color="textSecondary">
            Khác: {answer.answerAttribute.otherText}
          </Typography>
        </Box>
      );
    }

    return (
      <Typography variant="body2" noWrap title={String(answer.answer || '')}>
        {String(answer.answer || '')}
      </Typography>
    );
  };

  const renderStatistics = () => (
    <Stack spacing={3}>
      <Alert severity="info">
        <Typography variant="body2">
          Thống kê được tính toán dựa trên {statistics.totalSamples} mẫu dữ liệu được tạo
        </Typography>
      </Alert>

      {Object.entries(statistics.questionStats).map(([questionId, stats]) => {
        const question = formData.questions.find(q => q.id === questionId);
        if (!question) return null;

        return (
          <Accordion key={questionId}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
              <Typography variant="subtitle2">{question.title}</Typography>
            </AccordionSummary>
            <AccordionDetails>
              <Stack spacing={2}>
                {/* Thống kê số liệu */}
                {stats.mean !== undefined && (
                  <Box>
                    <Typography variant="body2" fontWeight="medium">
                      Thống kê mô tả:
                    </Typography>
                    <Stack direction="row" spacing={2} sx={{ mt: 1 }}>
                      <Chip 
                        label={`Trung bình: ${stats.mean.toFixed(2)}`} 
                        size="small" 
                        variant="outlined" 
                      />
                      {stats.standardDeviation !== undefined && (
                        <Chip 
                          label={`Độ lệch chuẩn: ${stats.standardDeviation.toFixed(2)}`} 
                          size="small" 
                          variant="outlined" 
                        />
                      )}
                    </Stack>
                  </Box>
                )}
                
                {/* Phân bố */}
                {stats.distribution && (
                  <Box>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                      Phân bố:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {Object.entries(stats.distribution).map(([optionId, count]) => {
                        const option = question.options?.find(opt => opt.id === optionId);
                        const percentage = ((count / statistics.totalSamples) * 100).toFixed(1);
                        return (
                          <Chip
                            key={optionId}
                            label={`${option?.text || optionId}: ${count} (${percentage}%)`}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                )}

                {/* Tương quan */}
                {stats.correlation && Object.keys(stats.correlation).length > 0 && (
                  <Box>
                    <Typography variant="body2" fontWeight="medium" sx={{ mb: 1 }}>
                      Tương quan với các biến khác:
                    </Typography>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {Object.entries(stats.correlation).map(([otherQuestionId, correlation]) => {
                        const otherQuestion = formData.questions.find(q => q.id === otherQuestionId);
                        const color = Math.abs(correlation) > 0.7 ? 'error' : 
                                    Math.abs(correlation) > 0.3 ? 'warning' : 'default';
                        return (
                          <Chip
                            key={otherQuestionId}
                            label={`${otherQuestion?.title}: ${correlation.toFixed(2)}`}
                            size="small"
                            color={color}
                            variant="outlined"
                          />
                        );
                      })}
                    </Stack>
                  </Box>
                )}
              </Stack>
            </AccordionDetails>
          </Accordion>
        );
      })}
    </Stack>
  );

  const paginatedSamples = samples.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage);

  return (
    <Dialog open={open} onClose={onClose} maxWidth="xl" fullWidth>
      <DialogTitle>
        <Stack direction="row" justifyContent="space-between" alignItems="center">
          <Box>
            <Typography variant="h5" component="div">
              Kết quả AI gợi ý
            </Typography>
            <Typography variant="body2" color="textSecondary">
              {samples.length} mẫu được tạo thành công • {selectedSamples.size} mẫu được chọn
            </Typography>
          </Box>
          
          <Stack direction="row" spacing={1}>
            <Tooltip title="Tải xuống CSV">
              <IconButton onClick={handleDownloadCSV} color="primary">
                <DownloadIcon />
              </IconButton>
            </Tooltip>
          </Stack>
        </Stack>
      </DialogTitle>
      
      <DialogContent>
        <Stack spacing={2}>
          {/* View toggle */}
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <ToggleButtonGroup
              value={viewMode}
              exclusive
              onChange={(_, newMode) => newMode && setViewMode(newMode)}
              size="small"
            >
              <ToggleButton value="table">
                <VisibilityIcon style={{ marginRight: 8 }} />
                Bảng dữ liệu
              </ToggleButton>
              <ToggleButton value="statistics">
                <BarChartIcon style={{ marginRight: 8 }} />
                Thống kê
              </ToggleButton>
            </ToggleButtonGroup>
          </Box>

          {viewMode === 'table' ? (
            <Box>
              <TableContainer component={Paper}>
                <Table size="small" stickyHeader>
                  <TableHead>
                    <TableRow>
                      <TableCell padding="checkbox">
                        <Checkbox
                          checked={selectedSamples.size === samples.length}
                          indeterminate={selectedSamples.size > 0 && selectedSamples.size < samples.length}
                          onChange={(e) => handleSelectAll(e.target.checked)}
                        />
                      </TableCell>
                      <TableCell>Mẫu #</TableCell>
                      {formData.questions.map(question => (
                        <TableCell key={question.id} sx={{ minWidth: 150 }}>
                          <Typography variant="caption" fontWeight="medium">
                            {question.title}
                          </Typography>
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {paginatedSamples.map((sample, index) => (
                      <TableRow key={sample.sampleId} hover>
                        <TableCell padding="checkbox">
                          <Checkbox
                            checked={selectedSamples.has(sample.sampleId)}
                            onChange={(e) => handleSelectSample(sample.sampleId, e.target.checked)}
                          />
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" fontWeight="medium">
                            #{page * rowsPerPage + index + 1}
                          </Typography>
                        </TableCell>
                        {formData.questions.map(question => {
                          const answer = sample.answers.find(a => a.questionId === question.id);
                          return (
                            <TableCell key={question.id}>
                              {renderAnswer(answer)}
                            </TableCell>
                          );
                        })}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25, 50]}
                component="div"
                count={samples.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={(_, newPage) => setPage(newPage)}
                onRowsPerPageChange={(e) => {
                  setRowsPerPage(parseInt(e.target.value, 10));
                  setPage(0);
                }}
                labelRowsPerPage="Số hàng mỗi trang:"
                labelDisplayedRows={({ from, to, count }) => `${from}-${to} của ${count}`}
              />
            </Box>
          ) : (
            renderStatistics()
          )}
        </Stack>
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} color="inherit">
          Đóng
        </Button>
        <Button
          onClick={handleApply}
          variant="contained"
          color="primary"
          disabled={selectedSamples.size === 0}
        >
          Áp dụng {selectedSamples.size > 0 && `(${selectedSamples.size} mẫu)`}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
