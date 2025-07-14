/**
 * Constants for date and time formatting patterns
 * Used with date-fns formatting
 */

const DateConstant = {
  /** Date only: DD/MM/YYYY (e.g., 27/04/2023) */
  DATE_ONLY: 'dd/MM/yyyy',
  
  /** Time only: HH:MM (e.g., 14:30) */
  TIME_ONLY: 'HH:mm',
  
  /** Date and time without seconds: DD/MM/YYYY HH:MM (e.g., 27/04/2023 14:30) */
  DATETIME: 'dd/MM/yyyy HH:mm',
  
  /** Full date and time with seconds: DD/MM/YYYY HH:MM:SS (e.g., 27/04/2023 14:30:45) */
  FULL_DATETIME: 'dd/MM/yyyy HH:mm:ss',

};

export default DateConstant; 