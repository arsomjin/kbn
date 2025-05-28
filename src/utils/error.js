// Error handling

import { addDoc, collection, getFirestore, serverTimestamp } from 'firebase/firestore';
import { showWarn } from './functions';

export const getErrorMessage = (eMsg) => {
  showWarn('[getErrorMessage] :', eMsg);
  if (!eMsg) return 'กรุณาทำรายการใหม่อีกครั้ง';

  if (eMsg.includes('Query.where')) {
    return 'กรุณาตรวจสอบพารามิเตอร์ที่ใช้ในการค้นหาข้อมูล';
  }

  return 'กรุณาทำรายการใหม่อีกครั้ง';
};

// Modular Firestore error logging
export const addErrorLogs = async (error) => {
  try {
    const db = getFirestore();
    const errorLog = {
      ...error,
      createdAt: serverTimestamp(),
      userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
      url: typeof window !== 'undefined' ? window.location.href : '',
    };
    await addDoc(collection(db, 'logs', 'errors', 'entries'), errorLog);
  } catch (e) {
    // Fallback: log to console if Firestore fails
    console.error('Failed to log error to Firestore:', e, error);
  }
};

/**
 * errorHandler - Universal error handler for both utility and React component usage.
 * @param error - The error object
 * @param showAlertFn - (optional) A context-aware alert function (e.g. from useModal)
 */
export const errorHandler = (error, showAlertFn) => {
  let msg = 'กรุณาทำรายการใหม่อีกครั้ง';
  if (error?.message) {
    msg = getErrorMessage(error.message);
  }
  if (showAlertFn) {
    showAlertFn({
      title: 'ไม่สำเร็จ',
      content: msg,
    });
  }
  showWarn('Error', { error, msg });
  addErrorLogs({ ...error, msg });
};
