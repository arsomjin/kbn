import { Timestamp } from 'firebase/firestore';
import i18n from '../translations/i18n';

// Format a date using the user's locale
export const formatDate = (
  date: Date | Timestamp | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  }
): string => {
  if (!date) return '';

  // Convert Firestore Timestamp to JavaScript Date if needed
  const jsDate = date instanceof Timestamp ? date.toDate() : date;

  // Get current language
  const currentLanguage = i18n.language;

  // Use Thai locale for Thai language, otherwise use browser default
  const locale = currentLanguage === 'th' ? 'th-TH' : undefined;

  try {
    return new Intl.DateTimeFormat(locale, options).format(jsDate);
  } catch (error) {
    console.error('Error formatting date:', error);
    return jsDate.toLocaleDateString();
  }
};

// Format a time using the user's locale
export const formatTime = (
  date: Date | Timestamp | null | undefined,
  options: Intl.DateTimeFormatOptions = {
    hour: 'numeric',
    minute: 'numeric'
  }
): string => {
  if (!date) return '';

  // Convert Firestore Timestamp to JavaScript Date if needed
  const jsDate = date instanceof Timestamp ? date.toDate() : date;

  // Get current language
  const currentLanguage = i18n.language;

  // Use Thai locale for Thai language, otherwise use browser default
  const locale = currentLanguage === 'th' ? 'th-TH' : undefined;

  try {
    return new Intl.DateTimeFormat(locale, options).format(jsDate);
  } catch (error) {
    console.error('Error formatting time:', error);
    return jsDate.toLocaleTimeString();
  }
};

// Format a relative time (e.g., "2 hours ago")
export const formatRelativeTime = (date: Date | Timestamp | string | null | undefined): string => {
  if (!date) return '';

  let jsDate: Date;
  if (date instanceof Timestamp) {
    jsDate = date.toDate();
  } else if (typeof date === 'string') {
    // Try ISO string first, fallback to Date constructor
    const parsed = Date.parse(date);
    jsDate = isNaN(parsed) ? new Date() : new Date(parsed);
  } else {
    jsDate = date as Date;
  }

  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - jsDate.getTime()) / 1000);

  if (diffInSeconds < 60) {
    return i18n.t('time:justNow');
  } else if (diffInSeconds < 3600) {
    const minutes = Math.floor(diffInSeconds / 60);
    return i18n.t('time:minutesAgo', { count: minutes });
  } else if (diffInSeconds < 86400) {
    const hours = Math.floor(diffInSeconds / 3600);
    return i18n.t('time:hoursAgo', { count: hours });
  } else if (diffInSeconds < 604800) {
    const days = Math.floor(diffInSeconds / 86400);
    return i18n.t('time:daysAgo', { count: days });
  } else {
    return formatDate(jsDate);
  }
};
