import { ReactNode, useEffect, useMemo, useState } from 'react';

import Alert from '@mui/material/Alert';
import AlertTitle from '@mui/material/AlertTitle';
import Box from '@mui/material/Box';
import Button from '@mui/material/Button';
import Grid from '@mui/material/Grid';
import InputLabel from '@mui/material/InputLabel';
import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import Stack from '@mui/material/Stack';
import Typography from '@mui/material/Typography';
import { getAllUserForms } from 'api/form';
import { encryptAndDownload } from 'api/mahoa';
import { ConvertToSthIcon, ErrorIcon, RefreshIcon } from 'assets/images/svg/icon';
import LinkInput from 'components/form/LinkInput';
import MainCard from 'components/MainCard';
import { MAINCARD_STYLE } from 'themes/component/style';
import { handleApiError } from 'utils/errorHandler';
import HuongDanMaHoa from './HuongDanMaHoa';

// Main entry for Mã hóa Data section
export default function MaHoaDataPage() {
  const [forms, setForms] = useState<Array<{ id: string; name: string; editLink: string }>>([]);
  const [selectedFormId, setSelectedFormId] = useState<string>('');
  const [formLink, setFormLink] = useState('');
  const [dataLink, setDataLink] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [errorAlert, setErrorAlert] = useState<{ title: string; description: ReactNode } | null>(null);

  const buildMaHoaErrorAlert = (rawErr: any): { title: string; description: ReactNode } | null => {
    const data = rawErr?.response?.data ?? rawErr;
    const title: string = data?.errorMessage || 'Dữ liệu không hợp lệ';
    // Support both shapes: { errorDetails: { rowErrors: [...] } } or { errorDetails: [...] }
    const details = data?.errorDetails;
    const rowErrors = Array.isArray(details?.rowErrors) ? details.rowErrors : (Array.isArray(details) ? details : []);
    if (!Array.isArray(rowErrors) || rowErrors.length === 0) {
      return { title, description: <Typography variant="body2">{title}</Typography> };
    }

    const description = (
      <div>
        {rowErrors.map((row: any, idx: number) => {
          const cells = Array.isArray(row?.cellErrors) ? row.cellErrors : [];
          const hasMany = cells.length > 1;
          return (
            <div key={`row-${row?.rowNumber}-${idx}`} style={{ marginBottom: 8 }}>
              <Typography variant="body2" sx={{ fontWeight: 400, mb: hasMany ? 0.5 : 0 }}>
                Lỗi tại hàng <strong>{row?.rowNumber}</strong>
                {!hasMany && cells[0] ? (
                  <>
                    {' '}– Cột <strong>'{cells[0].columnName}'</strong>: Đáp án <strong>'{cells[0].providedValue}'</strong>{' '}không tồn tại!
                  </>
                ) : null}
              </Typography>
              {hasMany && (
                <ul style={{ margin: 0, paddingLeft: 18 }}>
                  {cells.map((cell: any, i: number) => (
                    <li key={`cell-${i}`}>
                      <Typography variant="body2">
                        Cột <strong>'{cell.columnName}'</strong>: Đáp án <strong>'{cell.providedValue}'</strong>{' '}không tồn tại!
                      
                      </Typography>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          );
        })}
      </div>
    );
    return { title, description };
  };

  // Load forms
  useEffect(() => {
    (async () => {
      try {
        const list = await getAllUserForms();
        setForms((list || []).map((f) => ({ id: f.id, name: f.name, editLink: f.editLink })));
      } catch (err: any) {
        setErrorAlert({ title: 'Lỗi tải danh sách form', description: handleApiError(err, 'Không tải được danh sách form') });
      }
    })();
  }, []);

  // When a form is selected, autofill and disable link input
  const isUsingFormId = useMemo(() => Boolean(selectedFormId), [selectedFormId]);
  useEffect(() => {
    if (selectedFormId) {
      const f = forms.find((x) => x.id === selectedFormId);
      setFormLink(f?.editLink || '');
    } else {
      // user switched back to default -> clear link form
      setFormLink('');
    }
  }, [selectedFormId, forms]);

  const canSubmit = Boolean((isUsingFormId || formLink) && dataLink) && !submitting;

  const handleSubmit = async () => {
    if (!canSubmit) return;
    setSubmitting(true);
    setErrorAlert(null);
    try {
      // Build payload: if user selected default value, only send links
      const payload = selectedFormId
        ? { formId: selectedFormId, sheetLink: dataLink }
        : { formLink, sheetLink: dataLink };

      const { blob, filename } = await encryptAndDownload(payload as any);
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = filename || 'ma-hoa-data.xlsx';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err: any) {
      const maHoaAlert = buildMaHoaErrorAlert(err);
      if (maHoaAlert) {
        setErrorAlert(maHoaAlert);
      } else {
        setErrorAlert({ title: 'Lỗi tạo yêu cầu mã hóa', description: handleApiError(err, 'Không thể tạo yêu cầu mã hóa') });
      }
    } finally {
      setSubmitting(false);
    }
  };

  const handleReset = () => {
    setSelectedFormId('');
    setFormLink('');
    setDataLink('');
    setErrorAlert(null);
    setSubmitting(false);
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <MainCard sx={MAINCARD_STYLE}>
          <Grid container spacing={2}>
            {errorAlert && (
              <Grid item xs={12}>
                <Alert color="error" icon={<ErrorIcon />} sx={{ mb: 1 }}>
                  <AlertTitle variant="h6" sx={{ fontWeight: 500, lineHeight: 1.3, mb: 0.25 }}>
                    {errorAlert.title}
                  </AlertTitle>
                  <Box sx={{ '& ul': { m: 0, pl: 2 }, '& li': { mb: 0.5 } }}>
                    {errorAlert.description}
                  </Box>
                </Alert>
              </Grid>
            )}

            {/* Row 1: Tên Form + Link Form */}
            <Grid item xs={12} md={6}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="ten-form">Tên Form</InputLabel>
                <Select
                  id="ten-form"
                  size="medium"
                  value={selectedFormId}
                  onChange={(e) => setSelectedFormId(String(e.target.value))}
                  displayEmpty
                >
                  <MenuItem value="">
                    <em>- Chọn Form cần mã hóa -</em>
                  </MenuItem>
                  {forms.map((f) => (
                    <MenuItem key={f.id} value={f.id}>
                      {f.name}
                    </MenuItem>
                  ))}
                </Select>
              </Stack>
            </Grid>

            <Grid item xs={12} md={6}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="form-link">Link Form</InputLabel>
                <LinkInput
                id="form-link"
                value={formLink}
                  size="medium"
                  onChange={setFormLink}
                  placeholder="https://docs.google.com/forms/.../viewform"
                  disabled={false}
                  readOnly={isUsingFormId}
              />
            </Stack>
            </Grid>

            {/* Row 2: Link Data */}
            <Grid item xs={12}>
              <Stack sx={{ gap: 1 }}>
                <InputLabel htmlFor="data-link">Link Data của bạn</InputLabel>
                <LinkInput
                id="data-link"
                value={dataLink}
                  size="medium"
                  onChange={setDataLink}
                  placeholder="https://docs.google.com/spreadsheets/d/.../edit"
              />
            </Stack>
            </Grid>

            {/* Hướng dẫn mã hóa */}
            <Grid item xs={12}>
              <HuongDanMaHoa />
            </Grid>

            {/* Row 3: Action */}
            <Grid item xs={12} sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1 }}>
              <Button
                variant="outlined"
                color="secondary"
                size="large"
                startIcon={<RefreshIcon/>}
                onClick={handleReset}
              >
                Reset
              </Button>
              <Button
                variant="contained"
                color="primary"
                size="large"
                startIcon={<ConvertToSthIcon/>}
                disabled={!canSubmit}
                onClick={handleSubmit}
              >
                {submitting ? 'Đang xử lý...' : 'Mã hóa Data'}
              </Button>
            </Grid>
          </Grid>
        </MainCard>
      </Grid>
      {/* Danh sách mã hóa được bỏ theo yêu cầu */}
    </Grid>
  );
} 