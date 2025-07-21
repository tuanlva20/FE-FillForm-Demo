import Chip from '@mui/material/Chip';
import IconButton from '@mui/material/IconButton';
import Link from '@mui/material/Link';
import Paper from '@mui/material/Paper';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';
import Typography from '@mui/material/Typography';
import MainCard from 'components/MainCard';
import { Edit2, Eye, Trash } from 'iconsax-react';
import { useState } from 'react';

// Demo data (replace with API data in the future)
const demoRows = [
  {
    id: 1,
    name: 'Trả lời sự kiện',
    link: 'https://docs.google.com/forms/d/1VuKVkdu7hu-0p4uX_ar7XfjA9ZLQSoW8lB8tfav/edit',
    createdAt: '21/02/2025',
    status: 'success',
  },
  {
    id: 2,
    name: 'Trả lời sự kiện-01',
    link: 'https://docs.google.com/forms/d/1VuKVkdu7hu-0p4uX_ar7XfjA9ZLQSoW8lB8tfav/edit',
    createdAt: '21/02/2025',
    status: 'error',
  },
  {
    id: 3,
    name: 'Trả lời sự kiện-02',
    link: 'https://docs.google.com/forms/d/1VuKVkdu7hu-0p4uX_ar7XfjA9ZLQSoW8lB8tfav/edit',
    createdAt: '21/02/2025',
    status: 'processing',
  },
  {
    id: 4,
    name: 'Trả lời sự kiện-03',
    link: 'https://docs.google.com/forms/d/1VuKVkdu7hu-0p4uX_ar7XfjA9ZLQSoW8lB8tfav/edit',
    createdAt: '21/02/2025',
    status: 'success',
  },
];

const statusMap: Record<string, { label: string; color: 'success' | 'error' | 'warning' }> = {
  success: { label: 'Thành công', color: 'success' },
  error: { label: 'Thất bại', color: 'error' },
  processing: { label: 'Đang mã hóa', color: 'warning' },
};

export default function MaHoaDataFormList() {
  const [rows] = useState(demoRows);

  return (
    <MainCard title="Danh sách file mã hóa của bạn">
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>No.</TableCell>
              <TableCell>Tên Form</TableCell>
              <TableCell>Link Form</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={row.id} hover>
                <TableCell>{idx + 1}</TableCell>
                <TableCell>{row.name}</TableCell>
                <TableCell>
                  <Link href={row.link} target="_blank" rel="noopener noreferrer" underline="hover">
                    {row.link.slice(0, 40)}...
                  </Link>
                </TableCell>
                <TableCell>{row.createdAt}</TableCell>
                <TableCell>
                  <Chip
                    label={statusMap[row.status as keyof typeof statusMap].label}
                    color={statusMap[row.status as keyof typeof statusMap].color}
                    size="small"
                  />
                </TableCell>
                <TableCell align="center">
                  <Stack direction="row" spacing={1} justifyContent="center">
                    <Tooltip title="Xem chi tiết">
                      <IconButton size="small" color="primary">
                        <Eye size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Chỉnh sửa">
                      <IconButton size="small" color="secondary">
                        <Edit2 size={18} />
                      </IconButton>
                    </Tooltip>
                    <Tooltip title="Xóa">
                      <IconButton size="small" color="error">
                        <Trash size={18} />
                      </IconButton>
                    </Tooltip>
                  </Stack>
                </TableCell>
              </TableRow>
            ))}
            {rows.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} align="center">
                  <Typography color="text.secondary">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </MainCard>
  );
} 