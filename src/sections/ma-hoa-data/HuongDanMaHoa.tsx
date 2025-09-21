import Accordion from '@mui/material/Accordion';
import AccordionDetails from '@mui/material/AccordionDetails';
import AccordionSummary from '@mui/material/AccordionSummary';
import Box from '@mui/material/Box';
import Typography from '@mui/material/Typography';

export default function HuongDanMaHoa() {
  return (
    <Accordion>
      <AccordionSummary>Hướng dẫn mã hóa</AccordionSummary>
      <AccordionDetails>
        <Box sx={{ '& ul': { m: 0, pl: 2 }, '& li': { mb: 0.5 } }}>
          <ul>
            <li>
              <Typography variant="body2">
                <strong>Một lựa chọn (Radio/Dropdown)</strong>: ghi số của đáp án. Ví dụ: chọn đáp án 2 → nhập: <code>2</code>.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Nhiều lựa chọn (Checkbox)</strong>: ngăn cách các số bằng dấu <code>|</code>. Ví dụ: chọn đáp án 1 và 3 → nhập:{' '}
                <code>1|3</code>.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Đáp án “Khác” có nhập chữ/số</strong>: dùng dạng <code>mã-ghi_chu</code>. Ví dụ: đáp án “Khác” là 7, nhập “1234” →{' '}
                <code>7-1234</code>. Nếu chọn nhiều + “Khác”: ví dụ <code>1|3|7-ghi_chu</code>.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Thang điểm (Linear scale)</strong>: ghi đúng số đã chọn. Ví dụ: chọn mức 4 → <code>4</code>.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Câu hỏi dạng lưới (Grid)</strong>: mỗi mục/hàng là một cột trong Sheet. Radio: một số (như trên). Checkbox: nhiều
                số, ngăn cách <code>|</code>.
              </Typography>
            </li>
            <li>
              <Typography variant="body2">
                <strong>Câu hỏi ngày/giờ</strong>: Chưa hỗ trợ.
              </Typography>
            </li>
          </ul>
          <Typography variant="body2" color="text.secondary">
            Mẹo: Tránh dùng dấu <code>-</code> trong phần ghi chú của đáp án “Khác”; có thể dùng <code>_</code> để dễ đọc hơn.
          </Typography>
        </Box>
      </AccordionDetails>
    </Accordion>
  );
}
