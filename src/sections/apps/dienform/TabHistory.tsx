import { ChangeEvent, useEffect, useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
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
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import TableSortLabel from '@mui/material/TableSortLabel';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import { MAINCARD_STYLE } from 'themes/component/style';

// assets
import { DocumentDownload, Eye, SearchNormal1 } from 'iconsax-react';

// types
interface FormHistoryItem {
  id: number;
  name: string;
  type: string;
  createdAt: string;
  status: string;
  completedSurveys: number;
  totalSurveys: number;
  cost: number;
}

// Mock data for form history
const mockFormHistory: FormHistoryItem[] = [
  {
    id: 1,
    name: 'Khảo sát người dùng',
    type: 'Manual',
    createdAt: '2023-01-15',
    status: 'Completed',
    completedSurveys: 200,
    totalSurveys: 200,
    cost: 600000
  },
  {
    id: 2,
    name: 'Đánh giá sản phẩm',
    type: 'Auto',
    createdAt: '2023-01-20',
    status: 'Processing',
    completedSurveys: 85,
    totalSurveys: 150,
    cost: 450000
  },
  {
    id: 3,
    name: 'Phản hồi dịch vụ',
    type: 'Manual',
    createdAt: '2023-01-25',
    status: 'Completed',
    completedSurveys: 100,
    totalSurveys: 100,
    cost: 300000
  },
  {
    id: 4,
    name: 'Khảo sát thị hiếu',
    type: 'Auto',
    createdAt: '2023-02-01',
    status: 'Cancelled',
    completedSurveys: 20,
    totalSurveys: 100,
    cost: 60000
  }
];

// Define column keys for sorting
type ColumnKey = 'name' | 'type' | 'createdAt' | 'status' | 'completedSurveys' | 'cost';

// Define sort order
type Order = 'asc' | 'desc';

// ==============================|| DIENFORM - HISTORY ||============================== //

export default function TabHistory() {
  // States
  const [formHistory, setFormHistory] = useState<FormHistoryItem[]>([]);
  const [filteredHistory, setFilteredHistory] = useState<FormHistoryItem[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  
  // Pagination states
  const [page, setPage] = useState<number>(0);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  
  // Sorting states
  const [orderBy, setOrderBy] = useState<ColumnKey>('createdAt');
  const [order, setOrder] = useState<Order>('desc');

  // Handle search input change
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    const searchValue = event.target.value;
    setSearch(searchValue);
    applyFilters(searchValue, statusFilter);
  };

  // Handle status filter change
  const handleStatusFilterChange = (event: SelectChangeEvent<string>) => {
    const status = event.target.value;
    setStatusFilter(status);
    applyFilters(search, status);
  };

  // Apply filters based on search term and status
  const applyFilters = (searchTerm: string, status: string) => {
    let filtered = formHistory;
    
    // Apply search filter
    if (searchTerm) {
      const lowerSearchTerm = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (item) => 
          item.name.toLowerCase().includes(lowerSearchTerm) ||
          item.type.toLowerCase().includes(lowerSearchTerm) ||
          item.status.toLowerCase().includes(lowerSearchTerm)
      );
    }
    
    // Apply status filter
    if (status && status !== 'all') {
      filtered = filtered.filter(item => item.status === status);
    }
    
    setFilteredHistory(filtered);
  };

  // Handle page change
  const handleChangePage = (event: unknown, newPage: number) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event: ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle sort request
  const handleRequestSort = (property: ColumnKey) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort function for table data
  const sortData = (data: FormHistoryItem[]) => {
    return data.slice().sort((a, b) => {
      const isAsc = order === 'asc';
      
      switch (orderBy) {
        case 'name':
        case 'type':
        case 'status':
          return isAsc 
            ? a[orderBy].localeCompare(b[orderBy]) 
            : b[orderBy].localeCompare(a[orderBy]);
        
        case 'createdAt':
          return isAsc
            ? new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime()
            : new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        
        case 'completedSurveys':
        case 'cost':
          return isAsc
            ? a[orderBy] - b[orderBy]
            : b[orderBy] - a[orderBy];
        
        default:
          return 0;
      }
    });
  };

  // Export to Excel function
  const handleExportToExcel = () => {
    console.log('Exporting data to Excel:', filteredHistory);
    alert('Exporting data to Excel (This is a placeholder)');
  };

  // View form details function
  const handleViewDetails = (id: number) => {
    console.log('Viewing details for form ID:', id);
  };

  // Get chip color based on status
  const getStatusChipColor = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'success';
      case 'Processing':
        return 'warning';
      case 'Cancelled':
        return 'error';
      default:
        return 'default';
    }
  };

  // Load form history on component mount
  useEffect(() => {
    const fetchFormHistory = async () => {
      setLoading(true);
      
      try {
        // Simulate API call with setTimeout
        setTimeout(() => {
          setFormHistory(mockFormHistory);
          setFilteredHistory(mockFormHistory);
          setLoading(false);
        }, 1000);
      } catch (error) {
        console.error('Error fetching form history:', error);
        setLoading(false);
      }
    };
    
    fetchFormHistory();
  }, []);

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid size={12}>
        <MainCard 
          title="Lịch sử điền form" 
          secondary={
            <Button
              variant="contained"
              startIcon={<DocumentDownload />}
              onClick={handleExportToExcel}
            >
              Xuất Excel
            </Button>
          }
          sx={MAINCARD_STYLE}
        >
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid size={{ xs: 12, sm: 8, md: 6 }}>
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
            <Grid size={{ xs: 12, sm: 4, md: 3 }}>
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
                  <MenuItem value="Completed">Hoàn thành</MenuItem>
                  <MenuItem value="Processing">Đang xử lý</MenuItem>
                  <MenuItem value="Cancelled">Đã hủy</MenuItem>
                </Select>
              </FormControl>
            </Grid>
          </Grid>
          
          {loading ? (
            <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
              <CircularProgress />
            </Box>
          ) : filteredHistory.length === 0 ? (
            <Box sx={{ textAlign: 'center', py: 4 }}>
              <Typography variant="h6" color="textSecondary">Không tìm thấy dữ liệu</Typography>
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
                          active={orderBy === 'name'}
                          direction={orderBy === 'name' ? order : 'asc'}
                          onClick={() => handleRequestSort('name')}
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
                          active={orderBy === 'completedSurveys'}
                          direction={orderBy === 'completedSurveys' ? order : 'asc'}
                          onClick={() => handleRequestSort('completedSurveys')}
                        >
                          Lượt điền
                        </TableSortLabel>
                      </TableCell>
                      <TableCell>
                        <TableSortLabel
                          active={orderBy === 'cost'}
                          direction={orderBy === 'cost' ? order : 'asc'}
                          onClick={() => handleRequestSort('cost')}
                        >
                          Chi phí (VND)
                        </TableSortLabel>
                      </TableCell>
                      <TableCell align="center">Thao tác</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {sortData(filteredHistory)
                      .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                      .map((item, index) => (
                        <TableRow key={item.id} hover>
                          <TableCell>{page * rowsPerPage + index + 1}</TableCell>
                          <TableCell>{item.name}</TableCell>
                          <TableCell>{item.type}</TableCell>
                          <TableCell>{item.createdAt}</TableCell>
                          <TableCell>
                            <Chip 
                              label={item.status} 
                              color={getStatusChipColor(item.status)} 
                              size="small"
                            />
                          </TableCell>
                          <TableCell>
                            {item.completedSurveys}/{item.totalSurveys}
                          </TableCell>
                          <TableCell>
                            {new Intl.NumberFormat('vi-VN').format(item.cost)}
                          </TableCell>
                          <TableCell align="center">
                            <IconButton 
                              color="primary" 
                              size="small"
                              onClick={() => handleViewDetails(item.id)}
                            >
                              <Eye />
                            </IconButton>
                          </TableCell>
                        </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </TableContainer>
              
              <TablePagination
                rowsPerPageOptions={[5, 10, 25]}
                component="div"
                count={filteredHistory.length}
                rowsPerPage={rowsPerPage}
                page={page}
                onPageChange={handleChangePage}
                onRowsPerPageChange={handleChangeRowsPerPage}
                labelRowsPerPage="Hiển thị:"
              />
            </>
          )}
        </MainCard>
      </Grid>
    </Grid>
  );
}
