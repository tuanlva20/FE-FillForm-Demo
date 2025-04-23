import { useState } from 'react';

// material-ui
import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
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

// project-imports
import MainCard from 'components/MainCard';

// assets
import { InProcessIcon, PendingIcon, SuccessIcon } from 'assets/images/svg/icon';
import { Clock, CloseCircle, Edit2, Eye, SearchNormal1 } from 'iconsax-react';
import { MAINCARD_STYLE } from 'themes/component/style';

// Mock datal
const mockFormList = [
  { 
    id: 1, 
    name: 'Trả lời sự kiện', 
    scheduled: true, 
    scheduledTime: '01/02/2025', 
    progress: '10/200',
    status: 'in_progress',
  },
  { 
    id: 2, 
    name: 'Trả lời sự kiện 01', 
    scheduled: false, 
    scheduledTime: '01/02/2025', 
    progress: '200/200',
    status: 'completed',
  },
  { 
    id: 3, 
    name: 'Trả lời sự kiện 02', 
    scheduled: true, 
    scheduledTime: '01/02/2025', 
    progress: '28/393',
    status: '',
  }
];

interface ExpectedRatioFormListProps {
  onSchedule: (formId: number) => void;
  onViewDetails: (formId: number) => void;
}

export default function ExpectedRatioFormList({ onSchedule, onViewDetails }: ExpectedRatioFormListProps) {
  const [searchText, setSearchText] = useState('');
  
  const filteredForms = mockFormList.filter(form => 
    form.name.toLowerCase().includes(searchText.toLowerCase())
  );
  
  const getStatusChip = (status: string, progress: string) => {
    switch (status) {
      case 'completed':
        return (
          <Chip 
            color="success" 
            icon={<SuccessIcon />}
            label="Hoàn thành" 
            sx={{ borderRadius: '16px', fontWeight: 500 , pl: 1 }}
          />
        );
      case 'in_progress':
        return (
          <Chip 
            label="Đang thực thi" 
            color="info" 
            icon={<InProcessIcon />}
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

  return (
    <MainCard title="Danh sách Form" sx={MAINCARD_STYLE}>
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
              <TableCell align="center">Ngày</TableCell>
              <TableCell align="center">Số lượng</TableCell>
              <TableCell align="center">Trạng thái</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {filteredForms.map((form) => (
              <TableRow hover key={form.id}>
                <TableCell align="center">{form.id}</TableCell>
                <TableCell>{form.name}</TableCell>
                <TableCell align="center">
                  <IconButton color="primary" onClick={() => onSchedule(form.id)}>
                    {getScheduleIcon(form.scheduled)}
                  </IconButton>
                </TableCell>
                <TableCell align="center">{form.scheduledTime}</TableCell>
                <TableCell align="center">{form.progress}</TableCell>
                <TableCell align="center">{getStatusChip(form.status, form.progress)}</TableCell>
                <TableCell align="center">
                  <Stack direction="row" alignItems="center" justifyContent="center" spacing={1}>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton color="primary" size="small" onClick={() => onViewDetails(form.id)}>
                        <Edit2 size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xem chi tiết">
                      <IconButton color="info" size="small">
                        <Eye size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Mở form trong tab mới">
                      <IconButton color="primary" size="small" component="a" href="#" target="_blank">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                          <path d="M13 3L16.293 6.293L9.293 13.293L10.707 14.707L17.707 7.707L21 11V3H13Z" fill="currentColor"/>
                          <path d="M19 19H5V5H12L10 3H5C3.897 3 3 3.897 3 5V19C3 20.103 3.897 21 5 21H19C20.103 21 21 20.103 21 19V14L19 12V19Z" fill="currentColor"/>
                        </svg>
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
}