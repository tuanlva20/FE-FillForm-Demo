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
import { FillRequestDTO } from 'api/form';

interface FillRequestListProps {
  fillRequests: FillRequestDTO[];
  loading: boolean;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  page: number;
  rowsPerPage: number;
  onPageChange: (event: React.ChangeEvent<unknown>, value: number) => void;
  onRowsPerPageChange: (event: React.ChangeEvent<HTMLInputElement>) => void;
  onSchedule?: (requestId: string) => void;
  onViewDetails?: (requestId: string) => void;
  onEdit?: (requestId: string) => void;
}

export default function FillRequestList({ 
  fillRequests,
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
}: FillRequestListProps) {
  
  // Filter fill requests based on search text
  const filteredRequests = searchQuery.trim() === '' 
    ? fillRequests 
    : fillRequests.filter(request => {
        // Convert date to string for searching if available
        const dateStr = request.createdAt 
          ? new Date(request.createdAt).toLocaleDateString('vi-VN')
          : '';
        
        // Search by date or status
        return dateStr.toLowerCase().includes(searchQuery.toLowerCase()) ||
               (request.status && request.status.toLowerCase().includes(searchQuery.toLowerCase()));
      });
  
  // Get paginated requests
  const getPaginatedRequests = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredRequests.slice(startIndex, endIndex);
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

  // Calculate progress based on completed surveys
  const getProgressText = (request: FillRequestDTO) => {
    const completed = request.completedSurvey || 0;
    const total = request.surveyCount || 0;
    return `${completed}/${total}`;
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
              <TableCell align="center">Yêu cầu</TableCell>
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
            ) : getPaginatedRequests().length > 0 ? (
              getPaginatedRequests().map((request, index) => (
                <TableRow hover key={request.id}>
                  <TableCell align="center">{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>Yêu cầu điền form #{request.id?.slice(-6) || 'N/A'}</TableCell>
                  <TableCell align="center">
                    <IconButton 
                      color="primary" 
                      onClick={() => handleSchedule(request.id || '')}
                    >
                      {getScheduleIcon(!!request.scheduledTime)}
                    </IconButton>
                  </TableCell>
                  <TableCell align="center">{formatDate(request.createdAt || null)}</TableCell>
                  <TableCell align="center">{getProgressText(request)}</TableCell>
                  <TableCell align="center">{getStatusChip(request.status || '')}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <Tooltip title="Chỉnh sửa">
                        <IconButton 
                          color="primary" 
                          size="small" 
                          onClick={() => handleEdit(request.id || '')}
                        >
                          <Edit2 size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xem chi tiết">
                        <IconButton 
                          color="info" 
                          size="small"
                          onClick={() => handleViewDetails(request.id || '')}
                        >
                          <Eye size={18} />
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
                    {searchQuery ? 'Không tìm thấy yêu cầu nào phù hợp' : 'Chưa có yêu cầu điền form nào'}
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      

    </MainCard>
  );
} 