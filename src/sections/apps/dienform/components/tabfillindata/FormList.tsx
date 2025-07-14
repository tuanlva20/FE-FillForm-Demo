
// project utils and constants
import { formatFullDateTime } from 'utils/DateUtil';

// material-ui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
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
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';

// project-imports
import MainCard from 'components/MainCard';

// assets
import { InProcessIcon, PendingIcon, SuccessIcon } from 'assets/images/svg/icon';
import { Clock, CloseCircle, Edit2, Eye, SearchNormal1 } from 'iconsax-react';
import { MAINCARD_STYLE } from 'themes/component/style';

// types
import { FormData } from 'api/form';

interface DataFillFormListProps {
  forms: FormData[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSchedule?: (formId: string) => void;
  onViewDetails?: (formId: string) => void;
  onEdit?: (formId: string) => void;
}

export default function DataFillFormList({ 
  forms,
  loading,
  searchQuery,
  onSearchChange,
  page,
  rowsPerPage,
  onPageChange,
  onRowsPerPageChange,
  onSchedule,
  onViewDetails,
  onEdit
}: DataFillFormListProps) {
  
  // Filter forms based on search text
  const filteredForms = searchQuery.trim() === '' 
    ? forms 
    : forms.filter(form => {
        // Convert date to string for searching if available
        const dateStr = form.createdAt 
          ? new Date(form.createdAt).toLocaleDateString('vi-VN')
          : '';
        
        // Search by name, date, or status
        return form.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
               dateStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (form.status && form.status.toLowerCase().includes(searchQuery.toLowerCase()));
      });
  
  // Get paginated forms
  const getPaginatedForms = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredForms.slice(startIndex, endIndex);
  };
  
  const getStatusChip = (status: string) => {
    switch (status) {
      case 'COMPLETED':
        return (
          <Chip 
            color="success" 
            icon={<SuccessIcon />}
            label="Hoàn thành" 
            sx={{ borderRadius: '16px', fontWeight: 500 , pl: 1 }}
          />
        );
      case 'IN_PROGRESS':
        return (
          <Chip 
            label="Đang thực thi" 
            color="info" 
            icon={<InProcessIcon />}
            sx={{ borderRadius: '16px', fontWeight: 500, pl: 1 }}
          />
        );
      case 'PENDING':
        return (
          <Chip 
            label="Chưa bắt đầu" 
            color="secondary" 
            icon={<PendingIcon />}
            sx={{ borderRadius: '16px', fontWeight: 500, pl: 1 }}
          />
        );
      default:
        return (
          <Chip 
            label="Chưa bắt đầu" 
            color="secondary" 
            icon={<PendingIcon />}
            sx={{ borderRadius: '16px', fontWeight: 500, pl: 1 }}
          />
        );
    }
  };

  const getScheduleIcon = (isScheduled: boolean) => {
    if (isScheduled) {
      return (
        <Stack direction="row" spacing={0.5} alignItems="center">
          <Clock variant="Bold" size={18} color="#4096ff" />
          <CloseCircle size={16} color="#ff4d4f" />
        </Stack>
      );
    }
    return <Clock size={18} color="#d9d9d9" />;
  };

  // Calculate progress based on statistics
  const getProgressText = (form: FormData) => {
    if (form.statistics && form.statistics.completedSurvey !== undefined && form.statistics.totalSurvey !== undefined) {
      return `${form.statistics.completedSurvey || 0}/${form.statistics.totalSurvey}`;
    }
    return `0/0`;
  };

  // Format date string from ISO format
  const formatDate = (dateString: string | null) => {
    if (!dateString) return '';
    return formatFullDateTime(dateString, '');
  };

  // Handle view details
  const handleViewDetails = (id: string) => {
    if (onViewDetails) {
      onViewDetails(id);
    }
  };

  // Handle edit
  const handleEdit = (id: string) => {
    if (onEdit) {
      onEdit(id);
    }
  };

  // Handle schedule
  const handleSchedule = (id: string) => {
    if (onSchedule) {
      onSchedule(id);
    }
  };

  return (
    <MainCard title="Danh sách yêu cầu điền form" sx={MAINCARD_STYLE}>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm"
          value={searchQuery}
          onChange={(e) => onSearchChange(e.target.value)}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchNormal1 size={18} />
              </InputAdornment>
            )
          }}
          sx={{ maxWidth: 300 }}
        />
      </Box>
      
      <TableContainer>
        <Table>
          <TableHead>
            <TableRow>
              <TableCell align="center">No.</TableCell>
              <TableCell align="center">Tên Form</TableCell>
              <TableCell align="center">Hẹn giờ điền</TableCell>
              <TableCell align="center">Ngày tạo</TableCell>
              <TableCell align="center">Số lượng</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" color="textSecondary">
                    Đang tải...
                  </Typography>
                </TableCell>
              </TableRow>
            ) : getPaginatedForms().length > 0 ? (
              getPaginatedForms().map((form, index) => (
                <TableRow hover key={form.id}>
                  <TableCell align="center">{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{form.name}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleSchedule(form.id)}
                    >
                      {getScheduleIcon(false)} {/* TODO: Add scheduled time check */}
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">{formatDate(form.createdAt)}</TableCell>
                  <TableCell align="center">{getProgressText(form)}</TableCell>
                  <TableCell align="center">{getStatusChip(form.status || '')}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton 
                          color="primary" 
                          size="small" 
                          onClick={() => handleEdit(form.id)}
                        >
                          <Edit2 size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          color="info" 
                          size="small"
                          onClick={() => handleViewDetails(form.id)}
                        >
                          <Eye size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Mở form trong tab mới">
                        <IconButton 
                          color="primary" 
                          size="small" 
                          component="a" 
                          href={form.editLink} 
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M13 3L16.293 6.293L9.293 13.293L10.707 14.707L17.707 7.707L21 11V3H13Z" fill="currentColor"/>
                            <path d="M19 19H5V5H12L10 3H5C3.897 3 3 3.897 3 5V19C3 20.103 3.897 21 5 21H19C20.103 21 21 20.103 21 19V14L19 12V19Z" fill="currentColor"/>
                          </svg>
                        </IconButton>
                      </Tooltip>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={7} align="center">
                  <Typography variant="body1" color="textSecondary">
                    {searchQuery ? 'Không tìm thấy form nào phù hợp' : 'Chưa có form nào được tạo'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      
      {/* Pagination */}
      {filteredForms.length > 0 && (
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2">Hiển thị</Typography>
            <Select
              size="small"
              value={rowsPerPage.toString()}
              onChange={(event) => onRowsPerPageChange({ target: { value: event.target.value } } as React.ChangeEvent<HTMLInputElement>)}
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
            onChange={onPageChange}
            shape="rounded"
          />
        </Box>
      )}
    </MainCard>
  );
} 