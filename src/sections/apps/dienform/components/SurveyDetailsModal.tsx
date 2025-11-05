import { useEffect, useState } from 'react';

// material-ui
import {
  Accordion,
  AccordionDetails,
  AccordionSummary,
  Box,
  Button,
  Card,
  CardContent,
  Chip,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  FormControl,
  Grid,
  IconButton,
  InputLabel,
  MenuItem,
  Paper,
  Select,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TableSortLabel,
  Tooltip,
  Typography
} from '@mui/material';

// project-imports
import { AppliedAnswer, getSurveyDetails, SurveyDetail, SurveyStatistics } from 'api/form';
import MainCard from 'components/MainCard';
import StatusChip from 'components/StatusChip';
import { TablePagination as ReactTablePagination } from 'components/third-party/react-table';

// assets
import { Close, ExpandMore, Refresh } from '@mui/icons-material';

// types
type ColumnKey = 'rowIndex' | 'status' | 'executionTime' | 'answersApplied';
type Order = 'asc' | 'desc';

interface SurveyDetailsModalProps {
  open: boolean;
  onClose: () => void;
  fillRequestId: string;
  formName: string;
}

export default function SurveyDetailsModal({ open, onClose, fillRequestId, formName }: SurveyDetailsModalProps) {
  // States
  const [surveys, setSurveys] = useState<SurveyDetail[]>([]);
  const [statistics, setStatistics] = useState<SurveyStatistics | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Pagination states
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(20);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Sorting states
  const [orderBy, setOrderBy] = useState<ColumnKey>('executionTime');
  const [order, setOrder] = useState<Order>('asc');

  // Error detail popup states
  const [errorDetailOpen, setErrorDetailOpen] = useState<boolean>(false);
  const [selectedErrorMessage, setSelectedErrorMessage] = useState<string>('');

  // Handle status filter change
  const handleStatusFilterChange = (event: any) => {
    setStatusFilter(event.target.value);
    setPageIndex(0); // Reset to first page when changing filter
  };

  // Handle open error detail popup
  const handleOpenErrorDetail = (errorMessage: string) => {
    setSelectedErrorMessage(errorMessage);
    setErrorDetailOpen(true);
  };

  // Handle close error detail popup
  const handleCloseErrorDetail = () => {
    setErrorDetailOpen(false);
    setSelectedErrorMessage('');
  };

  // Handle sort request
  const handleRequestSort = (property: ColumnKey) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Fetch survey details (includes statistics)
  const fetchSurveyDetails = async () => {
    setLoading(true);
    try {
      const params = {
        page: pageIndex,
        size: pageSize,
        sortBy: orderBy,
        sortDir: order,
        status: statusFilter !== 'all' ? statusFilter : undefined
      };

      const response = await getSurveyDetails(fillRequestId, params);
      setSurveys(response.surveys);
      setStatistics(response.statistics);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching survey details:', error);
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when modal opens or parameters change
  useEffect(() => {
    if (open && fillRequestId) {
      fetchSurveyDetails();
    }
  }, [open, fillRequestId, pageIndex, pageSize, orderBy, order, statusFilter]);

  // Build state for ReactTablePagination
  const getTableState = () =>
    ({
      pagination: { pageIndex, pageSize },
      columnVisibility: {},
      columnOrder: [],
      columnPinning: { left: [], right: [] },
      rowSelection: {},
      sorting: [],
      columnFilters: [],
      globalFilter: '',
      expanded: {},
      columnSizing: {},
      columnSizingInfo: {
        startOffset: null,
        columnSizingStart: [],
        isResizingColumn: false,
        deltaOffset: null,
        deltaPercentage: null,
        startSize: null
      },
      rowPinning: { top: [], bottom: [] },
      grouping: []
    }) as any;

  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    const date = new Date(dateString);
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${day}/${month}/${year} ${hours}:${minutes}:${seconds}`;
  };

  // Format duration
  const formatDuration = (durationMs: number | null) => {
    if (!durationMs) return '-';
    if (durationMs < 1000) return `${durationMs}ms`;
    return `${(durationMs / 1000).toFixed(1)}s`;
  };


  // Parse applied answers from array or JSON string
  const parseAppliedAnswers = (answersApplied: AppliedAnswer[] | string | null): AppliedAnswer[] | null => {
    if (!answersApplied) return null;
    
    // If it's already an array, return it directly
    if (Array.isArray(answersApplied)) {
      return answersApplied;
    }
    
    // If it's a JSON string, try to parse it
    try {
      const parsed = JSON.parse(answersApplied);
      // Check if it's the old format with answersApplied property
      if (parsed.answersApplied && Array.isArray(parsed.answersApplied)) {
        return parsed.answersApplied;
      }
      // If it's directly an array
      if (Array.isArray(parsed)) {
        return parsed;
      }
      return null;
    } catch (error) {
      console.error('Error parsing applied answers:', error);
      return null;
    }
  };

  // Format applied answer for display
  const formatAppliedAnswer = (answer: AppliedAnswer): string => {
    switch (answer.type) {
      case 'RADIO':
        return answer.optionText || 'Đã chọn';
      case 'CHECKBOX':
        if (answer.optionTexts && answer.optionTexts.length > 0) {
          return answer.optionTexts.map(text => `- ${text}`).join('\n');
        }
        // Nếu có optionIds nhưng không có optionTexts, hiển thị thông báo
        if (answer.optionIds && answer.optionIds.length > 0) {
          return `Đã chọn ${answer.optionIds.length} đáp án (chi tiết không có sẵn)`;
        }
        return 'Không có đáp án nào được chọn';
      case 'GRID':
        return answer.columnText || 'Đã điền';
      case 'TEXT':
        return answer.value || '';
      case 'SCALE':
        return answer.value || '';
      default:
        return 'Đã điền';
    }
  };

  // Get question type display name
  const getQuestionTypeDisplay = (type: string): string => {
    const typeMap: Record<string, string> = {
      RADIO: 'Chọn một',
      CHECKBOX: 'Chọn nhiều',
      TEXT: 'Văn bản',
      SCALE: 'Thang đo',
      GRID: 'Lưới câu hỏi'
    };
    return typeMap[type] || type;
  };

  return (
    <Dialog
      open={open}
      onClose={onClose}
      maxWidth="lg"
      fullWidth
      PaperProps={{
        sx: { minHeight: '80vh' }
      }}
    >
      <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <Typography variant="h5">
          Chi tiết Đơn điền - {formName}
        </Typography>
        <Box sx={{ display: 'flex', gap: 1 }}>
          <IconButton 
            onClick={fetchSurveyDetails} 
            size="small" 
            disabled={loading}
            title="Làm mới dữ liệu"
          >
            <Refresh />
          </IconButton>
          <IconButton onClick={onClose} size="small">
            <Close />
          </IconButton>
        </Box>
      </DialogTitle>

      <DialogContent dividers>
        {/* Statistics Card */}
        {statistics && (
          <MainCard sx={{ mb: 3 }}>
            <Typography variant="h6" sx={{ mb: 2 }}>
              Thống kê tổng quan
            </Typography>
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="primary">
                      {statistics.totalSurveys}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Tổng số form
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="success.main">
                      {statistics.completedCount}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Hoàn thành
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="error.main">
                      {statistics.failedCount}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Không thành công
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
              <Grid item xs={12} sm={6} md={3}>
                <Card variant="outlined">
                  <CardContent sx={{ textAlign: 'center', py: 2 }}>
                    <Typography variant="h4" color="warning.main">
                      {statistics.pendingCount}
                    </Typography>
                    <Typography variant="body2" color="textSecondary">
                      Chờ xử lý
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            </Grid>
          </MainCard>
        )}

        {/* Filters */}
        <Box sx={{ mb: 2, display: 'flex', gap: 2, alignItems: 'center' }}>
          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel>Lọc theo trạng thái</InputLabel>
            <Select
              value={statusFilter}
              onChange={handleStatusFilterChange}
              label="Lọc theo trạng thái"
            >
              <MenuItem value="all">Tất cả</MenuItem>
              <MenuItem value="PENDING">Chờ xử lý</MenuItem>
              <MenuItem value="IN_PROGRESS">Đang xử lý</MenuItem>
              <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
              <MenuItem value="FAILED">Không thành công</MenuItem>
              <MenuItem value="CANCELLED">Đã hủy</MenuItem>
            </Select>
          </FormControl>
        </Box>

        {/* Survey Details Table */}
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
            <CircularProgress />
          </Box>
        ) : surveys.length === 0 ? (
          <Box sx={{ textAlign: 'center', py: 4 }}>
            <Typography variant="h6" color="textSecondary">
              Không có dữ liệu
            </Typography>
          </Box>
        ) : (
          <>
            <TableContainer component={Paper} variant="outlined">
              <Table sx={{ minWidth: 650 }}>
                <TableHead>
                  <TableRow>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'rowIndex'}
                        direction={orderBy === 'rowIndex' ? order : 'asc'}
                        onClick={() => handleRequestSort('rowIndex')}
                      >
                        Survey #
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'status'}
                        direction={orderBy === 'status' ? order : 'asc'}
                        onClick={() => handleRequestSort('status')}
                      >
                        Trạng thái
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'executionTime'}
                        direction={orderBy === 'executionTime' ? order : 'asc'}
                        onClick={() => handleRequestSort('executionTime')}
                      >
                        Thời gian thực thi
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>
                      <TableSortLabel
                        active={orderBy === 'answersApplied'}
                        direction={orderBy === 'answersApplied' ? order : 'asc'}
                        onClick={() => handleRequestSort('answersApplied')}
                      >
                        Câu trả lời
                      </TableSortLabel>
                    </TableCell>
                    <TableCell>Thông tin lỗi</TableCell>
                    <TableCell>Chi tiết</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {surveys.map((survey) => {
                    const appliedAnswersData = parseAppliedAnswers(survey.answersApplied);
                    const hasAnswers = appliedAnswersData && appliedAnswersData.length > 0;
                    
                    return (
                      <TableRow key={survey.taskId} hover>
                        <TableCell>{survey.rowIndex + 1}</TableCell>
                        <TableCell>
                          <StatusChip
                            status={survey.status}
                            size="small"
                          />
                        </TableCell>
                        <TableCell>{formatDate(survey.executionTime)}</TableCell>
                        <TableCell>
                          {hasAnswers ? (
                            <Chip
                              label={`${appliedAnswersData?.length} câu trả lời`}
                              color="success"
                              size="small"
                              variant="outlined"
                            />
                          ) : (
                            <Chip
                              label="Chưa điền"
                              color="default"
                              size="small"
                              variant="outlined"
                            />
                          )}
                        </TableCell>
                        <TableCell>
                          {survey.errorMessage ? (
                            <Tooltip 
                              title={survey.errorMessage}
                              arrow
                              placement="top"
                              sx={{
                                '& .MuiTooltip-tooltip': {
                                  maxWidth: 400,
                                  backgroundColor: '#d32f2f',
                                  color: 'white',
                                  whiteSpace: 'pre-wrap',
                                  wordBreak: 'break-word',
                                  padding: '8px 12px',
                                  fontSize: '0.875rem'
                                }
                              }}
                            >
                              <Box
                                onClick={() => handleOpenErrorDetail(survey.errorMessage || '')}
                                sx={{
                                  cursor: 'pointer',
                                  maxWidth: '120px',
                                  overflow: 'hidden',
                                  textOverflow: 'ellipsis',
                                  whiteSpace: 'nowrap',
                                  display: 'block',
                                  '&:hover': {
                                    textDecoration: 'underline',
                                    color: 'error.dark'
                                  }
                                }}
                              >
                                <Typography 
                                  variant="body2" 
                                  color="error"
                                  sx={{
                                    overflow: 'hidden',
                                    textOverflow: 'ellipsis',
                                    whiteSpace: 'nowrap'
                                  }}
                                >
                                  {survey.errorMessage}
                                </Typography>
                              </Box>
                            </Tooltip>
                          ) : (
                            '-'
                          )}
                        </TableCell>
                        <TableCell>
                          {hasAnswers && (
                            <Accordion sx={{ boxShadow: 'none', '&:before': { display: 'none' } }}>
                              <AccordionSummary
                                expandIcon={<ExpandMore />}
                                sx={{ minHeight: 'auto', py: 0 }}
                              >
                                <Typography variant="body2" color="primary">
                                  Xem chi tiết ({appliedAnswersData?.length} câu)
                                </Typography>
                              </AccordionSummary>
                              <AccordionDetails sx={{ pt: 0 }}>
                                <Box sx={{ maxHeight: 300, overflow: 'auto' }}>
                                  {appliedAnswersData?.map((answer, index) => (
                                    <Box key={index} sx={{ mb: 2, p: 1, border: '1px solid', borderColor: 'divider', borderRadius: 1 }}>
                                      <Typography variant="body2" sx={{ fontWeight: 'bold', mb: 0.5 }}>
                                        Câu {index + 1}: {answer.questionTitle}
                                      </Typography>
                                      <Typography variant="body2" sx={{ whiteSpace: 'pre-line' }}>
                                        <strong>Đáp án:</strong> {formatAppliedAnswer(answer)}
                                      </Typography>
                                    </Box>
                                  ))}
                                </Box>
                              </AccordionDetails>
                            </Accordion>
                          )}
                        </TableCell>
                      </TableRow>
                    );
                  })}
                </TableBody>
              </Table>
            </TableContainer>

            <Box sx={{ p: 2 }}>
              <ReactTablePagination
                setPageSize={setPageSize as any}
                setPageIndex={setPageIndex as any}
                getState={getTableState as any}
                getPageCount={() => totalPages}
                initialPageSize={20}
              />
            </Box>
          </>
        )}
      </DialogContent>

      <DialogActions>
        <Button onClick={onClose} variant="outlined">
          Đóng
        </Button>
      </DialogActions>

      {/* Error Detail Popup Dialog */}
      <Dialog
        open={errorDetailOpen}
        onClose={handleCloseErrorDetail}
        maxWidth="sm"
        fullWidth
      >
        <DialogTitle>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <Typography variant="h5">Chi tiết lỗi</Typography>
            <IconButton onClick={handleCloseErrorDetail} size="small">
              <Close />
            </IconButton>
          </Box>
        </DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2, p: 2, bgcolor: 'error.lighter', borderRadius: 1, border: '1px solid', borderColor: 'error.light' }}>
            {selectedErrorMessage.split(';').map((error, index) => (
              <Typography 
                key={index}
                variant="body2" 
                color="error" 
                sx={{ 
                  wordBreak: 'break-word',
                  mb: index < selectedErrorMessage.split(';').length - 1 ? 1 : 0
                }}
              >
                - {error.trim()}
              </Typography>
            ))}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseErrorDetail} variant="outlined">
            Đóng
          </Button>
        </DialogActions>
      </Dialog>
    </Dialog>
  );
}
