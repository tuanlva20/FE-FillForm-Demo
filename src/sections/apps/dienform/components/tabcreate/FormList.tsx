import { useCallback, useEffect, useState } from 'react';

// material-ui
import Alert from '@mui/material/Alert';
import Box from '@mui/material/Box';
import CircularProgress from '@mui/material/CircularProgress';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import Stack from '@mui/material/Stack';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import Tooltip from '@mui/material/Tooltip';

// project-imports
import MainCard from 'components/MainCard';
import { TablePagination } from 'components/third-party/react-table';
import AlertFormDelete from '../AlertFormDelete';

// utils
import { formatDate } from 'utils/DateUtil';

// api
import { deleteForm, FormData, getFormList } from 'api/form';

// third-party
import { TableState } from '@tanstack/react-table';

// assets
import { Trash } from 'iconsax-react';
import { MAINCARD_STYLE } from 'themes/component/style';

// ==============================|| FORM LIST ||============================== //

interface FormListProps {
  refreshTrigger?: boolean;
}

export default function FormList({ refreshTrigger }: FormListProps) {
  const [open, setOpen] = useState<boolean>(false);
  const [deleteFormId, setDeleteFormId] = useState<string | null>(null);
  const [deleteFormName, setDeleteFormName] = useState<string>('');
  const [forms, setForms] = useState<FormData[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  
  // Pagination state
  const [pageSize, setPageSize] = useState<number>(10);
  const [pageIndex, setPageIndex] = useState<number>(0);
  const [totalPages, setTotalPages] = useState<number>(0);

  const fetchForms = useCallback(async () => {
    setLoading(true);
    setError(null);
    
    try {
      const response = await getFormList(pageIndex, pageSize);
      setForms(response.content);
      setTotalPages(response.totalPages);
    } catch (err) {
      console.error('Error fetching forms:', err);
      setError('Không thể tải danh sách form. Vui lòng thử lại sau.');
    } finally {
      setLoading(false);
    }
  }, [pageIndex, pageSize]);

  // Fetch forms when component mounts, page changes, or refreshTrigger changes
  useEffect(() => {
    fetchForms();
  }, [fetchForms, refreshTrigger]);

  const handleDeleteClick = (id: string, name: string) => {
    setDeleteFormId(id);
    setDeleteFormName(name);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  const handleDeleteConfirm = async () => {
    if (deleteFormId) {
      try {
        await deleteForm(deleteFormId);
        fetchForms(); // Refresh the list after deletion
      } catch (err) {
        console.error('Error deleting form:', err);
        setError('Không thể xóa form. Vui lòng thử lại sau.');
      }
    }
    setOpen(false);
  };

  const getTableState = (): TableState => {
    return {
      pagination: { pageSize, pageIndex },
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
    };
  };

  return (
    <>
      <MainCard title="Danh sách Form đã tạo" content={false} sx={MAINCARD_STYLE}>
        {error && (
          <Box sx={{ p: 2 }}>
            <Alert 
              severity="error" 
              sx={{ 
                alignItems: 'center',
                '& .MuiAlert-icon': {
                  marginRight: 1,
                  pt: 1,
                  mt: 0
                }
              }}
            >
              {error}
            </Alert>
          </Box>
        )}
        
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>STT</TableCell>
                <TableCell>Tên Form</TableCell>
                <TableCell>Ngày Tạo</TableCell>
                {/* <TableCell>Link</TableCell> */}
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    <CircularProgress size={24} />
                  </TableCell>
                </TableRow>
              ) : forms.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    Không có dữ liệu
                  </TableCell>
                </TableRow>
              ) : (
                forms.map((form, index) => (
                  <TableRow key={form.id} hover>
                    <TableCell>{pageIndex * pageSize + index + 1}</TableCell>
                    <TableCell>{form.name}</TableCell>
                    <TableCell>{formatDate(form.createdAt)}</TableCell>
                    {/* <TableCell>{form.editLink}</TableCell> */}
                    <TableCell align="center">
                      <Stack direction="row" sx={{ justifyContent: 'center', alignItems: 'center' }}>
                        <Tooltip title="Delete">
                          <IconButton
                            color="error"
                            size="small"
                            onClick={() => handleDeleteClick(form.id, form.name)}
                          >
                            <Trash />
                          </IconButton>
                        </Tooltip>
                      </Stack>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <Divider />
        <Box sx={{ p: 2 }}>
          <TablePagination
            setPageSize={setPageSize}
            setPageIndex={setPageIndex}
            getState={getTableState}
            getPageCount={() => totalPages}
          />
        </Box>
      </MainCard>

      <AlertFormDelete
        id={deleteFormId}
        title={deleteFormName}
        open={open}
        handleClose={handleClose}
        handleConfirm={handleDeleteConfirm}
      />
    </>
  );
}