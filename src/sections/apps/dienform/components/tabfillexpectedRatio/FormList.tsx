import { useEffect, useState } from 'react';

// project utils and constants
import { formatDate, formatFullDateTime } from 'utils/DateUtil';

// material-ui
import Box from '@mui/material/Box';
import IconButton from '@mui/material/IconButton';
import InputAdornment from '@mui/material/InputAdornment';
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
import StatusChip from 'components/StatusChip';
import { Calendar, Clock, CloseCircle, Eye, SearchNormal1 } from 'iconsax-react';
import { MAINCARD_STYLE } from 'themes/component/style';

// types
import { FillRequestDTO } from 'api/form';

interface ExpectedRatioFormListProps {
  onSchedule: (formId: string) => void; // Changed from number to string
  onViewDetails: (formId: string) => void; // Changed from number to string
  onEdit: (formId: string) => void; // Changed from number to string
  onCancel?: (formId: string) => void;
  fillRequests?: FillRequestDTO[];
  formName?: string;
  formLink?: string;
  page?: number;
  rowsPerPage?: number;
}

export default function ExpectedRatioFormList({
  onSchedule,
  onViewDetails,
  onEdit,
  onCancel,
  fillRequests = [],
  formName = '',
  formLink = '',
  page = 1,
  rowsPerPage = 10
}: ExpectedRatioFormListProps) {
  const [searchText, setSearchText] = useState('');

  // Debug requests data when it changes
  useEffect(() => {
    console.log('Fill Requests updated:', fillRequests);
    if (fillRequests && fillRequests.length > 0) {
      console.log('First request ID:', fillRequests[0].id);
      console.log('First request ID type:', typeof fillRequests[0].id);
    }
  }, [fillRequests]);

  // Filter fillRequests based on search text
  const filteredForms =
    searchText.trim() === ''
      ? fillRequests
      : fillRequests.filter((request) => {
          // Convert dates to string for searching
          const createdDateStr = request.createdAt ? new Date(request.createdAt).toLocaleDateString('vi-VN') : '';
          const startDateStr = request.startDate ? new Date(request.startDate).toLocaleDateString('vi-VN') : '';
          const endDateStr = request.endDate ? new Date(request.endDate).toLocaleDateString('vi-VN') : '';

          // Convert total price to string for searching
          const priceStr = request.totalPrice?.toString() || '';

          // Search by dates, status, or price
          return (
            createdDateStr.toLowerCase().includes(searchText.toLowerCase()) ||
            startDateStr.toLowerCase().includes(searchText.toLowerCase()) ||
            endDateStr.toLowerCase().includes(searchText.toLowerCase()) ||
            (request.status && request.status.toLowerCase().includes(searchText.toLowerCase())) ||
            priceStr.includes(searchText)
          );
        });

  // Get paginated forms
  const getPaginatedForms = () => {
    const startIndex = (page - 1) * rowsPerPage;
    const endIndex = startIndex + rowsPerPage;
    return filteredForms.slice(startIndex, endIndex);
  };

  const getStatusChip = (status: string) => <StatusChip status={status} />;

  const getScheduleIcon = (isHumanLike: boolean | undefined) => {
    const color = isHumanLike ? '#ff4d4f' : '#d9d9d9';
    return <Clock size={18} color={color} />;
  };

  // Calculate progress based on completed and total surveys
  const getProgressText = (request: FillRequestDTO) => {
    // If there's a formStatistic available, use those values
    if (request.completedSurvey !== undefined && request.surveyCount !== undefined) {
      return `${request.completedSurvey || 0}/${request.surveyCount}`;
    }
    return `0/${request.surveyCount || 0}`;
  };

  // Format date string from ISO format for created date
  const formatCreatedDate = (dateString: string) => {
    if (!dateString) return '';
    return formatFullDateTime(dateString);
  };

  // Format date string to dd/mm/yyyy
  const formatDateOnly = (dateString: string) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('vi-VN', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric'
    });
  };

  // Handle view details with proper ID handling
  const handleViewDetails = (id: string | undefined) => {
    if (id && onEdit) {
      // Call onEdit instead of onViewDetails
      console.log('View details for ID:', id);
      onEdit(id); // This will load the answer distributions into the form
    }
  };

  // Handle edit with proper ID handling
  const handleEdit = (id: string | undefined) => {
    if (id && onEdit) {
      console.log('Edit for ID:', id);
      onEdit(id); // Pass the ID as is, without conversion
    }
  };

  return (
    <MainCard title="Danh sách yêu cầu điền của form" sx={MAINCARD_STYLE}>
      <Box sx={{ mb: 2 }}>
        <TextField
          fullWidth
          placeholder="Tìm kiếm"
          value={searchText}
          onChange={(e) => setSearchText(e.target.value)}
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
              <TableCell align="center">Ngày bắt đầu</TableCell>
              <TableCell align="center">Ngày kết thúc</TableCell>
              <TableCell align="center">Ngày dự kiến hoàn thành</TableCell>
              <TableCell align="center">Số lượng</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {getPaginatedForms().length > 0 ? (
              getPaginatedForms().map((request, index) => (
                <TableRow hover key={request.id || index}>
                  <TableCell align="center">{(page - 1) * rowsPerPage + index + 1}</TableCell>
                  <TableCell>{formName}</TableCell>
                  <TableCell align="center">
                    <Tooltip title="Hẹn giờ điền">
                      <IconButton
                        color="primary"
                        // onClick={() => onSchedule(request.id || '')}
                      >
                        {getScheduleIcon((request as any).isHumanLike ?? (request as any).humanLike)}
                      </IconButton>
                    </Tooltip>
                  </TableCell>
                  <TableCell align="center">{formatCreatedDate(request.createdAt || '')}</TableCell>
                  <TableCell align="center">{formatDate(request.startDate || '')}</TableCell>
                  <TableCell align="center">{formatDate(request.endDate || '')}</TableCell>
                  <TableCell align="center">{formatFullDateTime((request as any).estimatedCompletionDate || '')}</TableCell>
                  <TableCell align="center">{getProgressText(request)}</TableCell>
                  <TableCell align="center">{getStatusChip(request.status || '')}</TableCell>
                  <TableCell align="center">
                    <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                      <Tooltip title="Xem lịch điền">
                        <IconButton color="primary" size="small" onClick={() => onSchedule(request.id || '')}>
                          <Calendar size={18} />
                        </IconButton>
                      </Tooltip>
                      <Tooltip title="Xem chi tiết">
                        <IconButton color="info" size="small" onClick={() => handleViewDetails(request.id)}>
                          <Eye size={18} />
                        </IconButton>
                      </Tooltip>
                      {(request.status === 'IN_PROCESS' || request.status === 'QUEUED') && onCancel && (
                        <Tooltip title="Hủy yêu cầu điền form">
                          <IconButton color="error" size="small" onClick={() => onCancel(request.id || '')}>
                            <CloseCircle size={18} />
                          </IconButton>
                        </Tooltip>
                      )}
                    </Stack>
                  </TableCell>
                </TableRow>
              ))
            ) : (
              <TableRow>
                <TableCell colSpan={10} align="center">
                  <Typography variant="body1" color="textSecondary">
                    {searchText ? 'Không tìm thấy yêu cầu điền nào phù hợp' : 'Chưa có yêu cầu điền nào cho form này'}
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
