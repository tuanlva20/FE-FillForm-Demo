import Box from '@mui/material/Box';
import Chip from '@mui/material/Chip';
import Divider from '@mui/material/Divider';
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
import { getEncryptList } from 'api/mahoa';
import MainCard from 'components/MainCard';
import { TablePagination as ReactTablePagination } from 'components/third-party/react-table';
import { Edit2, Eye, Trash } from 'iconsax-react';
import { useEffect, useMemo, useState } from 'react';

const statusMap: Record<string, { label: string; color: 'success' | 'error' | 'warning' | 'default' }> = {
  success: { label: 'Thành công', color: 'success' },
  error: { label: 'Không thành công', color: 'error' },
  processing: { label: 'Đang mã hóa', color: 'warning' },
  pending: { label: 'Chờ xử lý', color: 'default' }
};

export default function MaHoaDataFormList() {
  const [rows, setRows] = useState<any[]>([]);
  const [pageIndex, setPageIndex] = useState(0);
  const [pageSize, setPageSize] = useState(10);
  const [total, setTotal] = useState(0);

  useEffect(() => {
    (async () => {
      const res = await getEncryptList(pageIndex, pageSize);
      setRows(res.content || []);
      setTotal(res.totalElements || 0);
    })();
  }, [pageIndex, pageSize]);

  const pageCount = useMemo(() => Math.ceil(total / pageSize), [total, pageSize]);

  return (
    <MainCard title="Danh sách file mã hóa của bạn">
      <TableContainer component={Paper}>
        <Table size="small">
          <TableHead>
            <TableRow>
              <TableCell>No.</TableCell>
              <TableCell>Tên Form</TableCell>
              <TableCell>Link Form</TableCell>
              <TableCell>Link Data</TableCell>
              <TableCell>Ngày tạo</TableCell>
              <TableCell>Trạng thái</TableCell>
              <TableCell align="center">Hành động</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {rows.map((row, idx) => (
              <TableRow key={row.id} hover>
                <TableCell>{pageIndex * pageSize + idx + 1}</TableCell>
                <TableCell>{row.formName}</TableCell>
                <TableCell>
                  <Link href={row.formLink} target="_blank" rel="noopener noreferrer" underline="hover">
                    {row.formLink?.length > 40 ? `${row.formLink.slice(0, 40)}...` : row.formLink}
                  </Link>
                </TableCell>
                <TableCell>
                  <Link href={row.sheetLink} target="_blank" rel="noopener noreferrer" underline="hover">
                    {row.sheetLink?.length > 40 ? `${row.sheetLink.slice(0, 40)}...` : row.sheetLink}
                  </Link>
                </TableCell>
                <TableCell>{row.createdAt}</TableCell>
                <TableCell>
                  <Chip label={statusMap[row.status]?.label || row.status} color={statusMap[row.status]?.color as any} size="small" />
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
                <TableCell colSpan={7} align="center">
                  <Typography color="text.secondary">Không có dữ liệu</Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
      <Divider />
      <Box sx={{ p: 2 }}>
        <ReactTablePagination
          setPageSize={setPageSize as any}
          setPageIndex={setPageIndex as any}
          getState={() => ({ pagination: { pageIndex, pageSize } }) as any}
          getPageCount={() => pageCount}
          initialPageSize={10}
        />
      </Box>
    </MainCard>
  );
}
