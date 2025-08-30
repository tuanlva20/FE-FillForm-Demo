import DateConstant from 'constants/DateConstant';
import { format, isValid, parseISO } from 'date-fns';
import { vi } from 'date-fns/locale';

/**
 * Format a date string using the specified format pattern
 *
 * @param dateString - The date string to format
 * @param pattern - The format pattern to apply (defaults to dd/MM/yyyy)
 * @param defaultValue - The value to return if date is invalid (defaults to 'N/A')
 * @returns Formatted date string or default value if invalid
 */
export const formatDate = (
  dateString: string | null | undefined,
  pattern: string = DateConstant.DATE_ONLY,
  defaultValue: string = 'N/A'
): string => {
  if (!dateString) return defaultValue;

  try {
    // Handle date-only strings (yyyy-MM-dd) as LOCAL dates to avoid timezone shift to previous day
    // Example: '2025-02-21' should render as 21/02/2025 in local time, not 20/02 due to UTC parsing
    let date: Date;
    const isDateOnly = /^\d{4}-\d{2}-\d{2}$/.test(dateString.trim());
    if (isDateOnly) {
      const [y, m, d] = dateString.split('-').map((v) => Number(v));
      // Create local date at midnight
      date = new Date(y, m - 1, d, 0, 0, 0, 0);
    } else {
      // Parse full ISO strings normally
      date = parseISO(dateString);
    }

    // Check if the date is valid
    if (!isValid(date)) return defaultValue;

    // Format the date with Vietnamese locale
    return format(date, pattern, { locale: vi });
  } catch (error) {
    console.error('Error formatting date:', error);
    return defaultValue;
  }
};

/**
 * Format a date string to display time (HH:mm)
 *
 * @param dateString - The date string to format
 * @param defaultValue - The value to return if date is invalid (defaults to 'N/A')
 * @returns Formatted time string
 */
export const formatTime = (dateString: string | null | undefined, defaultValue: string = 'N/A'): string => {
  return formatDate(dateString, DateConstant.TIME_ONLY, defaultValue);
};

/**
 * Format a date string to display both date and time
 *
 * @param dateString - The date string to format
 * @param defaultValue - The value to return if date is invalid (defaults to 'N/A')
 * @returns Formatted date and time string
 */
export const formatDateTime = (dateString: string | null | undefined, defaultValue: string = 'N/A'): string => {
  return formatDate(dateString, DateConstant.DATETIME, defaultValue);
};

/**
 * Format a date string to display full date and time with seconds
 *
 * @param dateString - The date string to format
 * @param defaultValue - The value to return if date is invalid (defaults to 'N/A')
 * @returns Formatted full date and time string with seconds
 */
export const formatFullDateTime = (dateString: string | null | undefined, defaultValue: string = 'N/A'): string => {
  return formatDate(dateString, DateConstant.FULL_DATETIME, defaultValue);
};
