// project-imports
import { ThemeMode } from 'config';

// types
import { PaletteThemeProps } from 'types/theme';

// ==============================|| PRESET THEME - KHAOSAT BRAND ||============================== //

export default function KhaosatBrand(mode: ThemeMode): PaletteThemeProps {
  const contrastText = '#fff';

  // Brand Colors for KHAOSAT.TECH
  // #673AB7 - Màu chủ đạo (Primary)
  // #9575CD - Màu phụ 1
  // #D1C4E9 - Màu phụ 2
  // #FFC107 - Màu nhấn chính (Warning/Accent)
  // #512DA8 - Màu phụ nhấn
  // #FFFFFF - Màu trung tính

  let primaryColors = ['#F3E5F5', '#E1BEE7', '#CE93D8', '#BA68C8', '#AB47BC', '#673AB7', '#5E35B1', '#512DA8', '#4527A0', '#311B92'];
  let secondaryColors = ['#F8F9FA', '#F3F5F7', '#D1C4E9', '#B39DDB', '#9575CD', '#7E57C2', '#673AB7', '#5E35B1', '#512DA8', '#4527A0'];
  let errorColors = ['#FFEBEE', '#FFCDD2', '#EF9A9A', '#E57373', '#EF5350', '#F44336', '#E53935', '#D32F2F', '#C62828', '#B71C1C'];
  let warningColors = ['#FFF8E1', '#FFECB3', '#FFE082', '#FFD54F', '#FFCA28', '#FFC107', '#FFB300', '#FFA000', '#FF8F00', '#FF6F00'];
  let infoColors = ['#E3F2FD', '#BBDEFB', '#90CAF9', '#64B5F6', '#42A5F5', '#2196F3', '#1E88E5', '#1976D2', '#1565C0', '#0D47A1'];
  let successColors = ['#E8F5E8', '#C8E6C9', '#A5D6A7', '#81C784', '#66BB6A', '#4CAF50', '#43A047', '#388E3C', '#2E7D32', '#1B5E20'];

  if (mode === ThemeMode.DARK) {
    // Dark mode variations of the brand colors
    primaryColors = ['#311B92', '#4527A0', '#512DA8', '#5E35B1', '#673AB7', '#7E57C2', '#9575CD', '#B39DDB', '#D1C4E9', '#F3E5F5'];
    secondaryColors = ['#1A1A1A', '#2D2D2D', '#424242', '#616161', '#757575', '#9E9E9E', '#BDBDBD', '#D1C4E9', '#E0E0E0', '#F5F5F5'];
    errorColors = ['#B71C1C', '#C62828', '#D32F2F', '#E53935', '#F44336', '#EF5350', '#E57373', '#EF9A9A', '#FFCDD2', '#FFEBEE'];
    warningColors = ['#FF6F00', '#FF8F00', '#FFA000', '#FFB300', '#FFC107', '#FFCA28', '#FFD54F', '#FFE082', '#FFECB3', '#FFF8E1'];
    infoColors = ['#0D47A1', '#1565C0', '#1976D2', '#1E88E5', '#2196F3', '#42A5F5', '#64B5F6', '#90CAF9', '#BBDEFB', '#E3F2FD'];
    successColors = ['#1B5E20', '#2E7D32', '#388E3C', '#43A047', '#4CAF50', '#66BB6A', '#81C784', '#A5D6A7', '#C8E6C9', '#E8F5E8'];
  }

  return {
    primary: {
      lighter: primaryColors[0],
      100: primaryColors[1],
      200: primaryColors[2],
      light: primaryColors[3],
      400: primaryColors[4],
      main: primaryColors[5], // #673AB7
      dark: primaryColors[6],
      700: primaryColors[7],
      darker: primaryColors[8], // #512DA8
      900: primaryColors[9],
      contrastText
    },
    secondary: {
      lighter: secondaryColors[0],
      100: secondaryColors[1],
      200: secondaryColors[2], // #D1C4E9
      light: secondaryColors[3],
      400: secondaryColors[4], // #9575CD
      500: secondaryColors[5],
      main: secondaryColors[6],
      dark: secondaryColors[7],
      800: secondaryColors[8],
      darker: secondaryColors[9],
      contrastText
    },
    error: {
      lighter: errorColors[0],
      light: errorColors[1],
      main: errorColors[2],
      dark: errorColors[3],
      darker: errorColors[4],
      contrastText
    },
    warning: {
      lighter: warningColors[0],
      light: warningColors[1],
      main: warningColors[2], // #FFC107 - Màu nhấn chính
      dark: warningColors[3],
      darker: warningColors[4],
      contrastText: '#000'
    },
    info: {
      lighter: infoColors[0],
      light: infoColors[1],
      main: infoColors[2],
      dark: infoColors[3],
      darker: infoColors[4],
      contrastText
    },
    success: {
      lighter: successColors[0],
      light: successColors[1],
      main: successColors[2],
      dark: successColors[3],
      darker: successColors[4],
      contrastText
    }
  };
}
