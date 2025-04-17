// material-ui
import Grid from '@mui/material/Grid2';

// project-imports
import MainCard from 'components/MainCard';
import ReactQuill from 'components/third-party/ReactQuill';
import { GRID_COMMON_SPACING, ThemeDirection } from 'config';
import useConfig from 'hooks/useConfig';
import ReactDraft from 'sections/forms/plugins/ReactDraft';

// ==============================|| PLUGIN - EDITOR ||============================== //

export default function Editor() {
  const { themeDirection } = useConfig();
  const quillText =
    "Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book. It has survived not only five centuries, but also the leap into electronic typesetting, remaining essentially unchanged. It was popularised in the 1960s with the release of Letraset sheets containing Lorem Ipsum passages, and more recently with desktop publishing software like Aldus PageMaker including versions of Lorem Ipsum.";

  return (
    <Grid container spacing={GRID_COMMON_SPACING}>
      <Grid
        size={12}
        sx={(theme) => ({
          '& .rdw-editor-wrapper': {
            bgcolor: 'background.paper',
            border: '1px solid',
            borderColor: 'secondary.light',
            borderRadius: '4px',
            overflow: 'visible',
            '& .rdw-editor-main': { px: 2, py: 0.5, border: 'none' },
            '& .rdw-editor-toolbar': {
              pt: 1.25,
              border: 'none',
              borderBottom: '1px solid',
              borderColor: 'secondary.light',
              bgcolor: 'secondary.lighter',
              '& .rdw-option-wrapper': {
                bgcolor: 'secondary.lighter',
                borderColor: 'secondary.light'
              },
              '& .rdw-dropdown-wrapper': {
                bgcolor: 'secondary.lighter',
                borderColor: 'secondary.light',
                '& .rdw-dropdown-selectedtext': { color: 'secondary.darker' },
                '& .rdw-dropdownoption-default': { color: 'secondary.darker' },
                '& .rdw-dropdown-carettoopen': { position: themeDirection === ThemeDirection.RTL ? 'initial' : 'absolute' }
              },
              '& .rdw-embedded-modal-size-input': { backgroundColor: 'secondary.lighter', color: 'secondary.main' },
              '& .rdw-emoji-modal': { left: { xs: -140, sm: -195, md: 5 } },
              '& .rdw-embedded-modal': { left: { xs: -100, sm: -165, md: 5 } },
              '& .rdw-link-modal': { left: { xs: 0, sm: -100, md: 5 } },
              '& .rdw-image-modal': { left: { xs: -190, sm: 30, md: 5 }, top: '15px' },
              '& .rdw-colorpicker-modal': { left: { xs: -150, sm: 5 } },
              ...theme.applyStyles('dark', {
                '& .rdw-dropdown-wrapper': { bgcolor: 'grey.500' },
                '& .rdw-option-wrapper': { bgcolor: 'grey.500' }
              })
            },
            ...(theme.direction === ThemeDirection.RTL && {
              '.rdw-dropdown-carettoopen': {
                position: 'absolute !important',
                right: '10%',
                left: 'inherit'
              },
              '.rdw-dropdown-carettoclose': { right: '10%', left: 'inherit' }
            }),
            ...theme.applyStyles('dark', {
              '& .rdw-link-modal, & .rdw-emoji-modal, & .rdw-embedded-modal, & .rdw-image-modal, & .rdw-colorpicker-modal': {
                bgcolor: 'background.default'
              },
              '& .rdw-dropdown-optionwrapper': {
                bgcolor: 'background.default',
                '& .rdw-dropdownoption-default': {
                  '&.rdw-dropdownoption-active': { bgcolor: 'background.paper' },
                  '&:hover': { bgcolor: 'background.paper' }
                }
              },
              '& .rdw-dropdown-selectedtext': { bgcolor: 'grey.500' },
              '& .rdw-link-modal-btn, & .rdw-image-modal-btn, & .rdw-embedded-modal-btn': {
                color: 'text.primary',
                ...theme.applyStyles('dark', { color: 'background.paper' })
              },
              '& .rdw-image-modal-btn:disabled, & .rdw-embedded-modal-btn:disabled, & .rdw-link-modal-btn:disabled': {
                bgcolor: 'grey.500'
              }
            })
          }
        })}
      >
        <MainCard title="React Draft" sx={{ overflow: 'visible' }}>
          <ReactDraft />
        </MainCard>
      </Grid>
      <Grid size={12}>
        <MainCard title="React Quill">
          <ReactQuill defaultText={quillText} />
        </MainCard>
      </Grid>
    </Grid>
  );
}
