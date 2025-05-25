/**
 * React Hooks for Date Handling in KBN Application
 *
 * These hooks provide a simple, consistent interface for handling dates
 * between Antd components and Firestore across the application.
 *
 * @author KBN Development Team
 * @version 2.0.0
 */

import { useCallback, useMemo } from 'react';
import { notification } from 'antd';
import { useTranslation } from 'react-i18next';
import {
  processFormDataForFirestore,
  processFirestoreDataForForm,
  toDayjs,
  toJSDate,
  toFirestoreTimestamp,
  formatDateForDisplay,
  validateDateField,
  validateDateRange,
  isDateField,
  DateInput,
  FormDataProcessingOptions,
  DATE_FORMATS
} from '../utils/dateHandling';

// ===== MAIN HOOK FOR FORM DATE HANDLING =====

/**
 * Primary hook for handling dates in forms
 * Provides methods to convert between form and Firestore formats
 */
export const useDateHandling = (options?: FormDataProcessingOptions) => {
  const { t } = useTranslation();

  // Prepare form data for saving to Firestore
  const prepareForSave = useCallback(
    (formData: Record<string, any>) => {
      try {
        return processFormDataForFirestore(formData, options);
      } catch (error) {
        console.error('Error preparing data for save:', error);
        notification.error({
          message: t('common.error'),
          description: t('errors.dateConversion')
        });
        return formData; // Return original data as fallback
      }
    },
    [options, t]
  );

  // Prepare Firestore data for form
  const prepareForForm = useCallback(
    (firestoreData: Record<string, any>) => {
      try {
        return processFirestoreDataForForm(firestoreData, options);
      } catch (error) {
        console.error('Error preparing data for form:', error);
        notification.error({
          message: t('common.error'),
          description: t('errors.dateConversion')
        });
        return firestoreData; // Return original data as fallback
      }
    },
    [options, t]
  );

  // Convert date for display
  const formatForDisplay = useCallback((date: DateInput, format = DATE_FORMATS.DISPLAY) => {
    return formatDateForDisplay(date, format);
  }, []);

  // Validation functions
  const validateDate = useCallback((value: any, required = false) => {
    return validateDateField(value, required);
  }, []);

  const validateRange = useCallback((startDate: any, endDate: any) => {
    return validateDateRange(startDate, endDate);
  }, []);

  return {
    prepareForSave,
    prepareForForm,
    formatForDisplay,
    validateDate,
    validateRange,
    // Direct conversion functions
    toDayjs,
    toJSDate,
    toFirestoreTimestamp,
    isDateField
  };
};

// ===== SPECIALIZED HOOKS =====

/**
 * Hook for handling date range forms (common in reports)
 */
export const useDateRangeHandling = () => {
  const { t } = useTranslation();

  const validateDateRange = useCallback(
    (rule: any, value: any, callback: any) => {
      const { startDate, endDate } = value || {};

      if (!startDate || !endDate) {
        callback(t('validation.dateRangeRequired'));
        return;
      }

      const start = toDayjs(startDate);
      const end = toDayjs(endDate);

      if (!start || !end) {
        callback(t('validation.invalidDateFormat'));
        return;
      }

      if (start.isAfter(end)) {
        callback(t('validation.startDateAfterEndDate'));
        return;
      }

      callback();
    },
    [t]
  );

  const formatRangeForFirestore = useCallback((range: { startDate: any; endDate: any }) => {
    return {
      startDate: toFirestoreTimestamp(range.startDate),
      endDate: toFirestoreTimestamp(range.endDate)
    };
  }, []);

  const formatRangeForForm = useCallback((range: { startDate: any; endDate: any }) => {
    return {
      startDate: toDayjs(range.startDate),
      endDate: toDayjs(range.endDate)
    };
  }, []);

  return {
    validateDateRange,
    formatRangeForFirestore,
    formatRangeForForm
  };
};

/**
 * Hook for handling timestamp fields (created/updated times)
 */
export const useTimestampHandling = () => {
  const addTimestamps = useCallback((data: Record<string, any>, isUpdate = false) => {
    const now = new Date();

    if (isUpdate) {
      return {
        ...data,
        updatedAt: toFirestoreTimestamp(now)
      };
    } else {
      return {
        ...data,
        createdAt: toFirestoreTimestamp(now),
        updatedAt: toFirestoreTimestamp(now)
      };
    }
  }, []);

  const formatTimestampsForDisplay = useCallback((data: Record<string, any>) => {
    const result = { ...data };

    if (data.createdAt) {
      result.createdAtDisplay = formatDateForDisplay(data.createdAt, DATE_FORMATS.DISPLAY_WITH_TIME);
    }

    if (data.updatedAt) {
      result.updatedAtDisplay = formatDateForDisplay(data.updatedAt, DATE_FORMATS.DISPLAY_WITH_TIME);
    }

    return result;
  }, []);

  return {
    addTimestamps,
    formatTimestampsForDisplay
  };
};

/**
 * Hook for handling multi-province date filtering
 */
export const useProvinceDateHandling = () => {
  const buildDateQuery = useCallback((startDate: DateInput, endDate: DateInput, provinceId: string) => {
    const start = toJSDate(startDate);
    const end = toJSDate(endDate);

    if (!start || !end) {
      throw new Error('Invalid date range provided');
    }

    return {
      where: [
        ['provinceId', '==', provinceId],
        ['date', '>=', start.toISOString().split('T')[0]], // YYYY-MM-DD format
        ['date', '<=', end.toISOString().split('T')[0]]
      ]
    };
  }, []);

  return {
    buildDateQuery
  };
};

// ===== UTILITY HOOKS =====

/**
 * Hook for batch date processing
 */
export const useBatchDateProcessing = () => {
  const processBatch = useCallback((items: Record<string, any>[], operation: 'toFirestore' | 'toForm') => {
    const processor = operation === 'toFirestore' ? processFormDataForFirestore : processFirestoreDataForForm;

    return items.map(item => processor(item));
  }, []);

  return {
    processBatch
  };
};

/**
 * Hook for debugging date conversions
 */
export const useDateDebugging = () => {
  const logDateConversion = useCallback((original: any, converted: any, operation: string) => {
    if (process.env.NODE_ENV === 'development') {
      console.group(`🕒 Date Conversion: ${operation}`);
      console.log('Original:', original);
      console.log('Converted:', converted);

      // Log date fields specifically
      Object.keys(original).forEach(key => {
        if (isDateField(key)) {
          console.log(`📅 ${key}:`, {
            original: original[key],
            converted: converted[key],
            type: typeof converted[key]
          });
        }
      });

      console.groupEnd();
    }
  }, []);

  return {
    logDateConversion
  };
};

// ===== MEMOIZED CONSTANTS =====

/**
 * Hook that provides memoized date formats and options
 */
export const useDateConstants = () => {
  const formats = useMemo(() => DATE_FORMATS, []);

  const defaultOptions = useMemo(
    (): FormDataProcessingOptions => ({
      processNested: true,
      dateOptions: {
        preserveTime: true,
        suppressWarnings: false
      }
    }),
    []
  );

  return {
    formats,
    defaultOptions
  };
};

// ===== COMBINED HOOK FOR COMMON OPERATIONS =====

/**
 * All-in-one hook for most common date handling operations
 */
export const useCompleteDateHandling = (options?: FormDataProcessingOptions) => {
  const dateHandling = useDateHandling(options);
  const rangeHandling = useDateRangeHandling();
  const timestampHandling = useTimestampHandling();
  const constants = useDateConstants();
  const debugging = useDateDebugging();

  return {
    ...dateHandling,
    ...rangeHandling,
    ...timestampHandling,
    ...constants,
    ...debugging
  };
};

export default useDateHandling;
