import { ChangeEvent, useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import OutlinedInput from '@mui/material/OutlinedInput';
import Select, { SelectChangeEvent } from '@mui/material/Select';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';

// project-imports
import { FormReportItem, getFormReports } from 'api/form';
import MainCard from 'components/MainCard';
import StatusChip from 'components/StatusChip';
import { TablePagination as ReactTablePagination } from 'components/third-party/react-table';
import { GRID_COMMON_SPACING } from 'config';
import { MAINCARD_STYLE } from 'themes/component/style';

// assets
import { SearchNormal1 } from 'iconsax-react';

// types
type ColumnKey = 'formName' | 'type' | 'createdAt' | 'status' | 'completedSurvey' | 'totalCost' | 'estimatedCompletionDate';
type Order = 'asc' | 'desc';

// ==============================|| DIENFORM - HISTORY ||============================== //

export default function TabHistory() {
  // States
  const [formHistory, setFormHistory] = useState<FormReportItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');

  // Pagination states
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [pageSize, setPageSize] = useState<number>(10);
  const [totalElements, setTotalElements] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  // Sorting states
  const [orderBy, setOrderBy] = useState<ColumnKey>('createdAt');
  const [order, setOrder] = useState<Order>('desc');

  // Handle search input change
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    setSearch(event.target.value);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    setStatusFilter(event.target.value);
  };



  // Handle type filter change
  const handleTypeFilterChange = (event: SelectChangeEvent<string>) => {
    setTypeFilter(event.target.value);
  };

  // Handle date changes
  const handleStartDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setStartDate(event.target.value);
  };

  const handleEndDateChange = (event: ChangeEvent<HTMLInputElement>) => {
    setEndDate(event.target.value);
  };

  // Apply filters and fetch data
  const applyFilters = async () => {
    setPageIndex(0); // Reset to first page when applying filters
    await fetchFormReports();
  };

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

  // Handle sort request
  const handleRequestSort = (property: ColumnKey) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Fetch form reports from API
  const fetchFormReports = async () => {
    setLoading(true);

    try {
      const params = {
        searchTerm: search || undefined,
        status: statusFilter !== 'all' ? statusFilter : undefined,
        type: typeFilter !== 'all' ? typeFilter : undefined,
        startDate: startDate || undefined,
        endDate: endDate || undefined,
        page: pageIndex,
        size: pageSize,
        sortBy: orderBy,
        sortDirection: order
      };

      const response = await getFormReports(params);
      setFormHistory(response.content);
      setTotalElements(response.totalElements);
      setTotalPages(response.totalPages);
    } catch (error) {
      console.error('Error fetching form reports:', error);
      // You can add error handling here (e.g., show snackbar)
    } finally {
      setLoading(false);
    }
  };

  // Fetch data when filters, pagination, or sorting changes
  useEffect(() => {
    fetchFormReports();
  }, [pageIndex, pageSize, orderBy, order]);



  // View form details function
  const handleViewDetails = (id: string) => {
    console.log('Viewing details for form ID:', id);
  };



  // Format date for display
  const formatDate = (dateString: string) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('vi-VN');
  };

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={12}>
        <MainCard
          title="Lịch sử điền form"
          sx={MAINCARD_STYLE}
        >
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <FormControl fullWidth>
                <OutlinedInput
                  id="search-form-history"
                  placeholder="Tìm kiếm theo tên, loại, trạng thái..."
                  value={search}
                  onChange={handleSearchChange}
                  startAdornment={
                    <InputAdornment position="start">
                      <SearchNormal1 />
                    </InputAdornment>
                  }
                />
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="status-filter-label">Trạng thái</InputLabel>
                <Select
                  labelId="status-filter-label"
                  id="status-filter"
                  value={statusFilter}
                  onChange={handleStatusFilterChange}
                  label="Trạng thái"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="COMPLETED">Hoàn thành</MenuItem>
                  <MenuItem value="IN_PROCESS">Đang xử lý</MenuItem>
                  <MenuItem value="QUEUED">Đang chờ</MenuItem>
                  <MenuItem value="FAILED">Thất bại</MenuItem>
                </Select>
              </FormControl>
            </Grid>

            <Grid size={{ xs: 12, sm: 6, md: 2 }}>
              <FormControl fullWidth>
                <InputLabel id="type-filter-label">Loại</InputLabel>
                <Select
                  labelId="type-filter-label"
                  id="type-filter"
                  value={typeFilter}
                  onChange={handleTypeFilterChange}
                  label="Loại"
                >
                  <MenuItem value="all">Tất cả</MenuItem>
                  <MenuItem value="Điền theo data">Điền theo data</MenuItem>
                  <MenuItem value="Điền theo tỉ lệ">Điền theo tỉ lệ</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Từ ngày"
                value={startDate}
                onChange={handleStartDateChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
            <Grid size={{ xs: 12, sm: 6, md: 3 }}>
              <TextField
                fullWidth
                type="date"
                label="Đến ngày"
                value={endDate}
                onChange={handleEndDateChange}
                InputLabelProps={{ shrink: true }}
              />
            </Grid>
          </Grid>

          <Box sx={{ mb: 2, textAlign: 'center' }}>
            <Button variant="contained" onClick={applyFilters} disabled={loading}>
              Áp dụng bộ lọc
            </Button>
          </Box>

          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : formHistory.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">
                Không tìm thấy dữ liệu
              </Typography>
            </Box>
          ) : (
            <>
              <TableContainer>
                <Table sx={{ minWidth: 650 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>STT</TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'formName'}
                          direction={orderBy === 'formName' ? order : 'asc'}
                          onClick={() => handleRequestSort('formName')}
                        >
                          Tên Form
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'type'}
                          direction={orderBy === 'type' ? order : 'asc'}
                          onClick={() => handleRequestSort('type')}
                        >
                          Loại
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'createdAt'}
                          direction={orderBy === 'createdAt' ? order : 'asc'}
                          onClick={() => handleRequestSort('createdAt')}
                        >
                          Ngày tạo
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
                          active={orderBy === 'completedSurvey'}
                          direction={orderBy === 'completedSurvey' ? order : 'asc'}
                          onClick={() => handleRequestSort('completedSurvey')}
                        >
                          Lượt điền
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'totalCost'}
                          direction={orderBy === 'totalCost' ? order : 'asc'}
                          onClick={() => handleRequestSort('totalCost')}
                        >
                          Chi phí (VND)
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'estimatedCompletionDate'}
                          direction={orderBy === 'estimatedCompletionDate' ? order : 'asc'}
                          onClick={() => handleRequestSort('estimatedCompletionDate')}
                        >
                          Ngày dự kiến
                        </TableSortLabel>
                      </TableCell>
                      {/* <TableCell align="center">Thao tác</TableCell> */}
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {formHistory.map((item, index) => (
                      <TableRow key={item.id} hover>
                        <TableCell>{pageIndex * pageSize + index + 1}</TableCell>
                        <TableCell>{item.formName}</TableCell>
                        <TableCell>{item.type}</TableCell>
                        <TableCell>{formatDate(item.createdAt)}</TableCell>
                        <TableCell>
                          <StatusChip status={item.status} size="small" />
                        </TableCell>
                        <TableCell>{item.completedSurvey}/{item.surveyCount}</TableCell>
                        <TableCell>{new Intl.NumberFormat('vi-VN').format(item.totalCost)}</TableCell>
                        <TableCell>{formatDate(item.estimatedCompletionDate)}</TableCell>
                        {/* <TableCell align="center">
                          <IconButton color="primary" size="small" onClick={() => handleViewDetails(item.id)}>
                            <Eye />
                          </IconButton>
                        </TableCell> */}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>

              <Box sx={{ p: 2 }}>
                <ReactTablePagination
                  setPageSize={setPageSize as any}
                  setPageIndex={setPageIndex as any}
                  getState={getTableState as any}
                  getPageCount={() => totalPages}
                  initialPageSize={10}
                />
              </Box>
            </>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}
