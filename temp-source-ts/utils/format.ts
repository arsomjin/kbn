import { DateTime } from 'luxon';

/**
 * Format a number as currency
 * @param amount - The amount to format
 * @param currency - The currency code (default: 'THB')
 * @returns Formatted currency string
 */
export const formatCurrency = (amount: number, currency = 'THB'): string => {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  }).format(amount);
};

/**
 * Format a number with commas
 * @param number - The number to format
 * @returns Formatted number string
 */
export const formatNumber = (number: number): string => {
  return new Intl.NumberFormat('th-TH').format(number);
};

/**
 * Format a date
 * @param date - The date to format
 * @param format - The format to use (default: 'dd/MM/yyyy')
 * @returns Formatted date string
 */
export const formatDate = (date: number | Date, format = 'dd/MM/yyyy'): string => {
  const dt = typeof date === 'number' ? DateTime.fromMillis(date) : DateTime.fromJSDate(date);
  return dt.toFormat(format);
};

/**
 * Format a date and time
 * @param date - The date to format
 * @param format - The format to use (default: 'dd/MM/yyyy HH:mm')
 * @returns Formatted date and time string
 */
export const formatDateTime = (date: number | Date, format = 'dd/MM/yyyy HH:mm'): string => {
  const dt = typeof date === 'number' ? DateTime.fromMillis(date) : DateTime.fromJSDate(date);
  return dt.toFormat(format);
};

/**
 * Format a date range
 * @param startTimestamp - The start timestamp (milliseconds)
 * @param endTimestamp - The end timestamp (milliseconds)
 * @param format - The format to use (default: 'dd/MM/yyyy')
 * @returns Formatted date range string
 */
export const formatDateRange = (startTimestamp: number, endTimestamp: number, format = 'dd/MM/yyyy'): string => {
  const start = DateTime.fromMillis(startTimestamp).toFormat(format);
  const end = DateTime.fromMillis(endTimestamp).toFormat(format);
  return `${start} - ${end}`;
};

/**
 * Format a phone number
 * @param phoneNumber - The phone number to format
 * @returns Formatted phone number string
 */
export const formatPhoneNumber = (phoneNumber: string): string => {
  const cleaned = phoneNumber.replace(/\D/g, '');
  const match = cleaned.match(/^(\d{3})(\d{3})(\d{4})$/);
  if (match) {
    return `${match[1]}-${match[2]}-${match[3]}`;
  }
  return phoneNumber;
};

/**
 * Format a file size
 * @param bytes - The size in bytes
 * @returns Formatted file size string
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};
