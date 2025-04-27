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
  pattern: string = 'dd/MM/yyyy',
  defaultValue: string = 'N/A'
): string => {
  if (!dateString) return defaultValue;

  try {
    // Parse ISO string to Date object
    const date = parseISO(dateString);
    
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
export const formatTime = (
  dateString: string | null | undefined,
  defaultValue: string = 'N/A'
): string => {
  return formatDate(dateString, 'HH:mm', defaultValue);
};

/**
 * Format a date string to display both date and time
 * 
 * @param dateString - The date string to format
 * @param defaultValue - The value to return if date is invalid (defaults to 'N/A')
 * @returns Formatted date and time string
 */
export const formatDateTime = (
  dateString: string | null | undefined,
  defaultValue: string = 'N/A'
): string => {
  return formatDate(dateString, 'dd/MM/yyyy HH:mm', defaultValue);
};