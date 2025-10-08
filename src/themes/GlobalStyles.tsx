// material-ui
import MuiGlobalStyles from '@mui/material/GlobalStyles';

// ==============================|| THEME - GLOBAL STYLE  ||============================== //

export default function GlobalStyles() {
  return (
    <MuiGlobalStyles
      styles={(theme) => ({
        // Preload Inter font to prevent FOUT (Flash of Unstyled Text)
        '@font-face': {
          fontFamily: 'Inter',
          fontStyle: 'normal',
          fontDisplay: 'swap',
          fontWeight: '100 900',
          src: 'url(https://fonts.gstatic.com/s/inter/v12/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff2) format("woff2")',
          unicodeRange: 'U+0000-00FF, U+0131, U+0152-0153, U+02BB-02BC, U+02C6, U+02DA, U+02DC, U+2000-206F, U+2074, U+20AC, U+2122, U+2191, U+2193, U+2212, U+2215, U+FEFF, U+FFFD'
        },
        // Apply Inter font to all elements
        '*': {
          fontFamily: "'Inter', sans-serif !important"
        },
        // global-style -> apexcharts
        '.apexcharts-theme-dark .apexcharts-menu': {
          borderColor: theme.palette.text.secondary,
          color: theme.palette.text.primary,
          '& .apexcharts-menu-item:hover': {
            color: theme.palette.primary.main
          }
        }
      })}
    />
  );
}
