import { useState } from 'react';

// material-ui
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
import AlertFormDelete from '../AlertFormDelete';

// assets
import { Trash } from 'iconsax-react';
import { MAINCARD_STYLE } from 'themes/component/style';

// types
interface FormData {
  id: number;
  name: string;
  creationDate: string;
}

// ==============================|| FORM LIST ||============================== //

export default function FormList() {
  const [open, setOpen] = useState<boolean>(false);
  const [deleteFormId, setDeleteFormId] = useState<number | null>(null);
  const [deleteFormName, setDeleteFormName] = useState<string>('');

  // Mock data for demonstration
  const forms: FormData[] = [
    { id: 1, name: 'Trả lời sự kiện', creationDate: '05/3/2025' },
    { id: 2, name: 'Trả lời sự kiện 01', creationDate: '05/3/2025' },
    { id: 3, name: 'Trả lời sự kiện 02', creationDate: '01/3/2025' }
  ];

  const handleDeleteClick = (id: number, name: string) => {
    setDeleteFormId(id);
    setDeleteFormName(name);
    setOpen(true);
  };

  const handleClose = () => {
    setOpen(false);
  };

  return (
    <>
      <MainCard title="Danh sách Form đã tạo" content={false} sx={MAINCARD_STYLE}>
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>No.</TableCell>
                <TableCell>Tên Form</TableCell>
                <TableCell>Ngày Tạo</TableCell>
                <TableCell align="center">Hành động</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {forms.map((form) => (
                <TableRow key={form.id} hover>
                  <TableCell>{form.id}</TableCell>
                  <TableCell>{form.name}</TableCell>
                  <TableCell>{form.creationDate}</TableCell>
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
              ))}
            </TableBody>
          </Table>
        </TableContainer>
      </MainCard>

      <AlertFormDelete
        id={deleteFormId}
        title={deleteFormName}
        open={open}
        handleClose={handleClose}
      />
    </>
  );
}