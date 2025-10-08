// project-imports
import { ThemeMode } from 'config';
import Theme2 from './theme2';

// types
import { PresetColor } from 'types/config';
import { PaletteThemeProps } from 'types/theme';

// ==============================|| PRESET THEME - THEME SELECTOR ||============================== //

const Theme = (presetColor: PresetColor, mode: ThemeMode): PaletteThemeProps => {
  return Theme2(mode);
};

export default Theme;
