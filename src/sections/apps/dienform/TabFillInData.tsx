import { useEffect, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Chip from '@mui/material/Chip';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import FormControl from '@mui/material/FormControl';
import Grid from '@mui/material/Grid2';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Pagination from '@mui/material/Pagination';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TextField from '@mui/material/TextField';
import Typography from '@mui/material/Typography';
import { Theme, useTheme } from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

// project-imports
import Avatar from 'components/@extended/Avatar';
import MainCard from 'components/MainCard';
import { GRID_COMMON_SPACING } from 'config';
import { MAINCARD_STYLE } from 'themes/component/style';

// components
import PaymentModal from './components/PaymentModal';

// assets
import { Tooltip } from '@mui/material';
import defaultImages from 'assets/images/users/default.png';
import { Add, ArrowRight2, Calendar, Clock, CloseCircle, Edit2, Eye, SearchNormal1, TickSquare } from 'iconsax-react';

// ==============================|| DIENFORM - FILL IN DATA ||============================== //

// Mock data for balance and form list
const mockBalance = {
  total: 150000,
  currency: 'VND'
};

// Mock form data
const mockFormList = [
  { 
    id: 1, 
    name: 'Trả lời sự kiện', 
    createdAt: '01/02/2025', 
    progress: '10/100',
    status: 'in_progress',
    link: 'https://docs.google.com/forms/d/1abcdefg',
    sheetLink: 'https://docs.google.com/spreadsheets/d/1234567'
  },
  { 
    id: 2, 
    name: 'Trả lời sự kiện 01', 
    createdAt: '01/02/2025', 
    progress: '200/200',
    status: 'completed',
    link: 'https://docs.google.com/forms/d/2abcdefg',
    sheetLink: 'https://docs.google.com/spreadsheets/d/2345678'
  },
  { 
    id: 3, 
    name: 'Trả lời sự kiện 02', 
    createdAt: '01/02/2025', 
    progress: '28/100',
    status: 'scheduled',
    link: 'https://docs.google.com/forms/d/3abcdefg',
    sheetLink: 'https://docs.google.com/spreadsheets/d/3456789'
  },
  { 
    id: 4, 
    name: 'Khảo sát ý kiến khách hàng', 
    createdAt: '10/04/2025', 
    progress: '56/300',
    status: 'in_progress',
    link: 'https://docs.google.com/forms/d/4abcdefg',
    sheetLink: 'https://docs.google.com/spreadsheets/d/4567890'
  },
  { 
    id: 5, 
    name: 'Đánh giá mức độ hài lòng', 
    createdAt: '20/03/2025', 
    progress: '89/150',
    status: 'in_progress',
    link: 'https://docs.google.com/forms/d/5abcdefg',
    sheetLink: 'https://docs.google.com/spreadsheets/d/5678901'
  },
  { 
    id: 6, 
    name: 'Thu thập thông tin người dùng', 
    createdAt: '15/03/2025', 
    progress: '120/120',
    status: 'completed',
    link: 'https://docs.google.com/forms/d/6abcdefg',
    sheetLink: 'https://docs.google.com/spreadsheets/d/6789012'
  }
];

// Mock questions data
const mockQuestions = [
  { 
    id: 'q1', 
    title: 'Họ và tên của bạn là gì?',
    type: 'text'
  },
  { 
    id: 'q2', 
    title: 'Bạn thuộc nhóm khách tham dự nào?',
    type: 'multiple_choice'
  },
  { 
    id: 'q3', 
    title: 'Email liên hệ của bạn?',
    type: 'text'
  },
  { 
    id: 'q4', 
    title: 'Bạn biết đến sự kiện này qua kênh nào?',
    type: 'multiple_choice'
  },
  { 
    id: 'q5', 
    title: 'Bạn có lời nhắn nào cho ban tổ chức không?',
    type: 'text'
  }
];

// Mock sheet columns
const mockSheetColumns = [
  'A - Timestamp',
  'B - Họ và tên',
  'C - Email',
  'D - Số điện thoại',
  'E - Nhóm khách',
  'F - Nguồn thông tin',
  'G - Lời nhắn',
  'H - Đăng ký workshop'
];

export default function TabFillInData() {
  const theme = useTheme();
  const downMD = useMediaQuery((theme: Theme) => theme.breakpoints.down('md'));
  
  // States for API interactions
  const [loading, setLoading] = useState<boolean>(false);
  const [forms, setForms] = useState<any[]>(mockFormList);
  const [balance, setBalance] = useState<any>(mockBalance);
  const [error, setError] = useState<string | null>(null);
  
  // State for payment modal
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState<boolean>(false);
  
  // State for form selection
  const [formLink, setFormLink] = useState<string>('');
  const [sheetLink, setSheetLink] = useState<string>('');
  
  // States for data checking
  const [isCheckingData, setIsCheckingData] = useState<boolean>(false);
  const [dataChecked, setDataChecked] = useState<boolean>(false);
  const [questions, setQuestions] = useState<any[]>([]);
  const [sheetColumns, setSheetColumns] = useState<string[]>([]);
  const [columnMappings, setColumnMappings] = useState<Map<string, string>>(new Map());
  
  // States for form list
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [page, setPage] = useState<number>(1);
  const [rowsPerPage, setRowsPerPage] = useState<number>(5);
  const [filteredForms, setFilteredForms] = useState<any[]>(forms);
  
  // Check data function
  const handleCheckData = () => {
    if (!formLink || !sheetLink) {
      setError('Vui lòng nhập đầy đủ link form và link sheet');
      return;
    }
    
    setIsCheckingData(true);
    setError(null);
    
    // Simulate API call
    setTimeout(() => {
      setQuestions(mockQuestions);
      setSheetColumns(mockSheetColumns);
      
      // Initialize column mappings with empty values
      const initialMappings = new Map<string, string>();
      mockQuestions.forEach(question => {
        initialMappings.set(question.id, '');
      });
      setColumnMappings(initialMappings);
      
      setDataChecked(true);
      setIsCheckingData(false);
    }, 1500);
  };
  
  // Handle mapping change
  const handleMappingChange = (questionId: string, columnValue: string) => {
    const newMappings = new Map(columnMappings);
    newMappings.set(questionId, columnValue);
    setColumnMappings(newMappings);
  };
  
  // Handle create fill request
  const handleCreateFillRequest = () => {
    // Validate mappings
    let hasEmptyMapping = false;
    columnMappings.forEach((value) => {
      if (!value) {
        hasEmptyMapping = true;
      }
    });
    
    if (hasEmptyMapping) {
      setError('Vui lòng map đầy đủ các câu hỏi với cột dữ liệu');
      return;
    }
    
    // Simulate API call
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setFormLink('');
      setSheetLink('');
      setDataChecked(false);
      setQuestions([]);
      setSheetColumns([]);
      setColumnMappings(new Map());
      
      // Show success
      alert('Tạo yêu cầu điền form thành công!');
    }, 1000);
  };
  
  // Open payment modal
  const handleOpenPaymentModal = () => {
    setIsPaymentModalOpen(true);
  };
  
  // Filter forms based on search query
  useEffect(() => {
    const filtered = mockFormList.filter(form => 
      form.name.toLowerCase().includes(searchQuery.toLowerCase())
    );
    setFilteredForms(filtered);
  }, [searchQuery]);
  
  // Get paginated forms
  const getPaginatedForms = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredForms.slice(startIndex, endIndex);
  };
  
  // Handle page change
  const handlePageChange = (event: React.ChangeEvent<unknown>, value: number) => {
    setPage(value);
  };
  
  // Handle rows per page change
  const handleRowsPerPageChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(1);
  };

  const getStatusChip = (status: string) => {
    switch (status) {
      case 'completed':
        return (
          <Chip
            icon={<TickSquare size={16} />}
            label="Hoàn thành"
            size="small"
            color="success"
            variant="light"
          />
        );
      case 'in_progress':
        return (
          <Chip
            icon={<Calendar size={16} />}
            label="Đang xử lý"
            size="small"
            color="warning"
            variant="light"
          />
        );
      case 'scheduled':
        return (
          <Chip
            icon={<Clock size={16} />}
            label="Đã lên lịch"
            size="small"
            color="primary"
            variant="light"
          />
        );
      default:
        return (
          <Chip
            icon={<CloseCircle size={16} />}
            label="Không xác định"
            size="small"
            color="error"
            variant="light"
          />
        );
    }
  };

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      {/* Balance Card */}
      <Grid size={12}>
        <MainCard sx={MAINCARD_STYLE}>
          <Grid container spacing={2}>
            <Grid size={{ xs: 12, sm: 6 }}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar alt="User" src={defaultImages} sx={{ width: 64, height: 64 }} />
                <Stack spacing={0.5}>
                  <Typography variant="h5">Số dư của bạn</Typography>
                  <Typography variant="h3" color="primary">
                    {new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(balance.total)}
                  </Typography>
                </Stack>
              </Stack>
            </Grid>
            <Grid size={{ xs: 12, sm: 6 }} sx={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
              <Button 
                variant="contained" 
                startIcon={<Add />} 
                onClick={handleOpenPaymentModal}
                sx={{ height: 'fit-content' }}
              >
                Nạp tiền
              </Button>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      
      {/* Form and Sheet Link Inputs */}
      <Grid size={12}>
        <MainCard title="Điền theo data có trước" sx={MAINCARD_STYLE}>
          {error && <Alert 
            severity="error" 
            sx={{ 
              mb: 2, 
              alignItems: 'center',
              '& .MuiAlert-icon': {
                marginRight: 1,
                pt: 1,
                mt: 1
              }
            }}
          >
            {error}
          </Alert>}
          
          <Grid container spacing={2}>
            <Grid size={{ xs: 12 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="ten-form">Tên Form</InputLabel>
                <TextField 
                  fullWidth 
                  id="ten-form" 
                  placeholder="Điền tên form..." 
                  autoFocus 
                />
              </Stack>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="link-form">Link Form</InputLabel>
                <TextField 
                  fullWidth 
                  id="link-form" 
                  placeholder="https://docs.google.com/forms/d/..." 
                  value={formLink}
                  onChange={(e) => setFormLink(e.target.value)}
                />
              </Stack>
            </Grid>
            
            <Grid size={{ xs: 12 }}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="link-data-sheet">Link Data Sheet</InputLabel>
                <TextField 
                  fullWidth 
                  id="link-data-sheet" 
                  placeholder="https://docs.google.com/spreadsheets/d/..." 
                  value={sheetLink}
                  onChange={(e) => setSheetLink(e.target.value)}
                />
              </Stack>
            </Grid>
            
            <Grid size={12} sx={{ display: 'flex', justifyContent: 'flex-end', mt: 1 }}>
              <Button 
                variant="contained" 
                color="primary"
                onClick={handleCheckData}
                disabled={isCheckingData || !formLink || !sheetLink}
              >
                {isCheckingData ? <CircularProgress size={24} color="inherit" /> : 'Kiểm tra dữ liệu'}
              </Button>
            </Grid>
          </Grid>
          
          {/* Data mapping section - shown after data check */}
          {dataChecked && (
            <>
              <Divider sx={{ my: 3 }} />
              
              <Typography variant="h5" sx={{ mb: 2 }}>Thông tin cột liên kết</Typography>
              <Typography variant="body2" sx={{ mb: 3 }}>
                Hãy kiểm tra các câu hỏi với cột liên kết trong data
              </Typography>
              
              {questions.map((question) => (
                <Box key={question.id} sx={{ mb: 3 }}>
                  <Grid container spacing={2} alignItems="center">
                    <Grid size={{ xs: 12, md: 5 }}>
                      <Typography fontWeight="500">
                        Câu hỏi: {question.title}
                      </Typography>
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 1 }} sx={{ display: 'flex', justifyContent: 'center' }}>
                      <ArrowRight2 size={24} />
                    </Grid>
                    
                    <Grid size={{ xs: 12, md: 6 }}>
                      <FormControl fullWidth>
                        <Select
                          value={columnMappings.get(question.id) || ''}
                          onChange={(e) => handleMappingChange(question.id, e.target.value)}
                          displayEmpty
                          size="small"
                        >
                          <MenuItem value="" disabled>
                            Chọn cột dữ liệu tương ứng
                          </MenuItem>
                          {sheetColumns.map((column) => (
                            <MenuItem key={column} value={column}>
                              {column}
                            </MenuItem>
                          ))}
                        </Select>
                      </FormControl>
                    </Grid>
                  </Grid>
                </Box>
              ))}
              
              <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}>
                <Button
                  variant="contained"
                  color="primary"
                  startIcon={<Clock />}
                  onClick={handleCreateFillRequest}
                  disabled={loading}
                >
                  {loading ? <CircularProgress size={24} color="inherit" /> : 'Tạo yêu cầu điền form'}
                </Button>
              </Box>
            </>
          )}
        </MainCard>
      </Grid>
      
      {/* Form List */}
      <Grid size={12}>
        <MainCard title="Danh sách yêu cầu điền form" sx={MAINCARD_STYLE}>
          <Stack spacing={3}>
            {/* Search bar */}
            <TextField 
              placeholder="Tìm kiếm..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              sx={{ maxWidth: 300 }}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchNormal1 size={18} />
                  </InputAdornment>
                )
              }}
            />
            
            {/* Table */}
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Stt.</TableCell>
                    <TableCell>Tên Form</TableCell>
                    <TableCell>Hẹn giờ điền</TableCell>
                    <TableCell>Ngày</TableCell>
                    <TableCell>Số lượng</TableCell>
                    <TableCell>Trạng thái</TableCell>
                    <TableCell align="center">Hành động</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {getPaginatedForms().map((form, index) => (
                    <TableRow hover key={form.id}>
                      <TableCell>{(page - 1) * rowsPerPage + index + 1}</TableCell>
                      <TableCell>{form.name}</TableCell>
                      <TableCell>
                        {1 !== 1 ? (
                          <Stack direction="row" spacing={0.5} alignItems="center">
                            {/* <Clock size={16} /> */}
                            {/* <Typography variant="body2" color="primary">
                              Đã lên lịch
                            </Typography> */}
                          </Stack>
                        ) : '-'}
                      </TableCell>
                      <TableCell>{form.createdAt}</TableCell>
                      <TableCell>{form.progress}</TableCell>
                      <TableCell>{getStatusChip(form.status)}</TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="Xem chi tiết">
                            <IconButton size="small" color="info">
                              <Eye size={18} />
                            </IconButton>
                          </Tooltip>
                          <Tooltip title="Chỉnh sửa">
                            <IconButton size="small" color="primary">
                              <Edit2 size={18} />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
            
            {/* Pagination */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Stack direction="row" spacing={1} alignItems="center">
                <Typography variant="body2">Hiển thị</Typography>
                <Select
                  size="small"
                  value={rowsPerPage.toString()}
                  onChange={(e) => handleRowsPerPageChange(e as React.ChangeEvent<HTMLInputElement>)}
                >
                  <MenuItem value={5}>5</MenuItem>
                  <MenuItem value={10}>10</MenuItem>
                  <MenuItem value={25}>25</MenuItem>
                </Select>
                <Typography variant="body2">mỗi trang</Typography>
              </Stack>
              
              <Pagination 
                count={Math.ceil(filteredForms.length / rowsPerPage)} 
                page={page}
                onChange={handlePageChange}
                shape="rounded"
              />
            </Box>
          </Stack>
        </MainCard>
      </Grid>
      
      {/* Payment Modal */}
      <PaymentModal
        open={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
      />
    </Grid>
  );
}
