import { Box, Chip, Divider, Stack, Typography } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { SectionData } from 'api/form';

interface SectionHeaderProps {
  sectionData: SectionData;
}

export default function SectionHeader({ sectionData }: SectionHeaderProps) {
  const theme = useTheme();
  
  console.log('SectionHeader - sectionData:', sectionData);

  // Display index is +1 from backend-provided section_index (only for UI)
  const displaySectionIndex = (() => {
    const n = Number.parseInt(String(sectionData.section_index), 10);
    return Number.isFinite(n) ? n + 1 : sectionData.section_index;
  })();

  return (
    <Box
      sx={{
        mb: 3,
        p: 3,
        borderRadius: 2,
        backgroundColor: alpha(theme.palette.primary.main, 0.08),
        border: `1px solid ${alpha(theme.palette.primary.main, 0.15)}`,
        position: 'relative',
        boxShadow: theme.shadows[1],
        overflow: 'hidden',
        '&::before': {
          content: '""',
          position: 'absolute',
          left: 0,
          top: 0,
          bottom: 0,
          width: 4,
          backgroundColor: theme.palette.primary.main,
          borderRadius: '2px 0 0 2px'
        }
      }}
    >
      <Stack spacing={2}>
        <Stack direction="row" alignItems="center" spacing={2}>
          <Chip
            label={`Phần ${displaySectionIndex}`}
            size="medium"
            color="primary"
            variant="filled"
            sx={{
              fontWeight: 700,
              fontSize: '0.875rem',
              height: 32,
              px: 1
            }}
          />
          <Typography
            variant="h5"
            sx={{
              fontWeight: 700,
              color: theme.palette.text.primary,
              flex: 1
            }}
          >
            {sectionData.section_title}
          </Typography>
        </Stack>
        
        {sectionData.section_description && (
          <Typography
            variant="body1"
            sx={{
              color: theme.palette.text.secondary,
              fontStyle: 'italic',
              borderLeft: `2px solid ${alpha(theme.palette.primary.main, 0.25)}`,
              pl: 2,
              py: 0.5
            }}
          >
            {sectionData.section_description}
          </Typography>
        )}
      </Stack>
      
      <Divider sx={{ mt: 2, mb: 0 }} />
    </Box>
  );
}
