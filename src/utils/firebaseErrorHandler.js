/**
 * Firebase Error Handler Utility
 * Provides user-friendly Thai error messages for all Firebase error codes
 */

// Firebase Authentication Error Messages
const AUTH_ERROR_MESSAGES = {
  // Sign In / Login Errors
  'auth/invalid-login-credentials': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
  'INVALID_LOGIN_CREDENTIALS': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
  'auth/user-not-found': 'ไม่พบผู้ใช้งานด้วยอีเมลนี้ กรุณาตรวจสอบอีเมลหรือลงทะเบียนใหม่',
  'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
  'auth/invalid-email': 'รูปแบบอีเมลไม่ถูกต้อง กรุณาป้อนอีเมลที่ถูกต้อง',
  'auth/user-disabled': 'บัญชีผู้ใช้นี้ถูกปิดใช้งาน กรุณาติดต่อผู้ดูแลระบบ',
  'auth/too-many-requests': 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่',
  'auth/operation-not-allowed': 'การดำเนินการนี้ไม่ได้รับอนุญาต กรุณาติดต่อผู้ดูแลระบบ',
  
  // Sign Up / Registration Errors
  'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ',
  'auth/weak-password': 'รหัสผ่านไม่ปลอดภัย กรุณาใช้รหัสผ่านที่มีความยาวอย่างน้อย 6 ตัวอักษร',
  'auth/invalid-password': 'รหัสผ่านไม่ถูกต้อง กรุณาป้อนรหัสผ่านที่ถูกต้อง',
  'auth/missing-password': 'กรุณาป้อนรหัสผ่าน',
  'auth/missing-email': 'กรุณาป้อนอีเมล',
  
  // Token & Session Errors
  'auth/expired-action-code': 'รหัสยืนยันหมดอายุแล้ว กรุณาขอรหัสใหม่',
  'auth/invalid-action-code': 'รหัสยืนยันไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
  'auth/user-token-expired': 'เซสชันหมดอายุแล้ว กรุณาเข้าสู่ระบบใหม่',
  'auth/invalid-user-token': 'เซสชันไม่ถูกต้อง กรุณาเข้าสู่ระบบใหม่',
  'auth/requires-recent-login': 'กรุณาเข้าสู่ระบบใหม่เพื่อดำเนินการต่อ',
  
  // Multi-Factor Authentication
  'auth/multi-factor-auth-required': 'ต้องการการยืนยันตัวตนแบบหลายขั้นตอน',
  'auth/maximum-second-factor-count-exceeded': 'มีการยืนยันตัวตนมากเกินกำหนด',
  'auth/second-factor-already-in-use': 'วิธีการยืนยันตัวตนนี้ถูกใช้งานแล้ว',
  
  // Network & Connection Errors
  'auth/network-request-failed': 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่',
  'auth/timeout': 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่',
  
  // Provider Errors
  'auth/account-exists-with-different-credential': 'บัญชีนี้มีอยู่แล้วแต่ใช้วิธีการเข้าสู่ระบบที่แตกต่าง',
  'auth/credential-already-in-use': 'ข้อมูลการยืนยันตัวตนนี้ถูกใช้กับบัญชีอื่นแล้ว',
  'auth/popup-closed-by-user': 'หน้าต่างป๊อปอัพถูกปิดโดยผู้ใช้',
  'auth/popup-blocked': 'เบราว์เซอร์บล็อกหน้าต่างป๊อปอัพ กรุณาอนุญาตและลองใหม่',
  
  // Custom Claims & Admin Errors
  'auth/claims-too-large': 'ข้อมูลสิทธิ์ผู้ใช้มีขนาดใหญ่เกินไป',
  'auth/id-token-expired': 'โทเค็นการยืนยันตัวตนหมดอายุแล้ว',
  'auth/id-token-revoked': 'โทเค็นการยืนยันตัวตนถูกยกเลิกแล้ว',
  'auth/insufficient-permission': 'สิทธิ์ไม่เพียงพอในการดำเนินการนี้',
  'auth/internal-error': 'เกิดข้อผิดพลาดภายในระบบ กรุณาลองใหม่ภายหลัง',
  
  // Argument Errors
  'auth/argument-error': 'ข้อมูลที่ส่งไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่',
  'auth/invalid-api-key': 'คีย์ API ไม่ถูกต้อง กรุณาติดต่อผู้ดูแลระบบ',
  'auth/app-not-authorized': 'แอปพลิเคชันไม่ได้รับอนุญาต กรุณาติดต่อผู้ดูแลระบบ',
  
  // Rate Limiting
  'auth/quota-exceeded': 'ใช้งานเกินกำหนด กรุณารอสักครู่แล้วลองใหม่',
  'auth/api-key-not-valid': 'คีย์ API ไม่ถูกต้อง'
};

// Firestore Error Messages
const FIRESTORE_ERROR_MESSAGES = {
  'cancelled': 'การดำเนินการถูกยกเลิก',
  'unknown': 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
  'invalid-argument': 'ข้อมูลที่ส่งไม่ถูกต้อง',
  'deadline-exceeded': 'การดำเนินการใช้เวลานานเกินกำหนด',
  'not-found': 'ไม่พบข้อมูลที่ต้องการ',
  'already-exists': 'ข้อมูลนี้มีอยู่แล้ว',
  'permission-denied': 'ไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้',
  'resource-exhausted': 'ทรัพยากรระบบถูกใช้งานเกินกำหนด',
  'failed-precondition': 'เงื่อนไขไม่เป็นไปตามที่กำหนด',
  'aborted': 'การดำเนินการถูกยกเลิก เนื่องจากข้อมูลมีการเปลี่ยนแปลง',
  'out-of-range': 'ข้อมูลเกินช่วงที่กำหนด',
  'unimplemented': 'ฟีเจอร์นี้ยังไม่รองรับ',
  'internal': 'เกิดข้อผิดพลาดภายในระบบ',
  'unavailable': 'ระบบไม่พร้อมใช้งานในขณะนี้',
  'data-loss': 'เกิดการสูญหายของข้อมูล',
  'unauthenticated': 'กรุณาเข้าสู่ระบบก่อนใช้งาน'
};

// Storage Error Messages
const STORAGE_ERROR_MESSAGES = {
  'storage/unknown': 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
  'storage/object-not-found': 'ไม่พบไฟล์ที่ต้องการ',
  'storage/bucket-not-found': 'ไม่พบที่เก็บไฟล์',
  'storage/project-not-found': 'ไม่พบโปรเจ็กต์',
  'storage/quota-exceeded': 'เกินพื้นที่เก็บข้อมูลที่กำหนด',
  'storage/unauthenticated': 'กรุณาเข้าสู่ระบบก่อนอัปโหลดไฟล์',
  'storage/unauthorized': 'ไม่มีสิทธิ์ในการอัปโหลดไฟล์นี้',
  'storage/retry-limit-exceeded': 'พยายามอัปโหลดเกินจำนวนครั้งที่กำหนด',
  'storage/invalid-checksum': 'ไฟล์เสียหาย กรุณาลองอัปโหลดใหม่',
  'storage/canceled': 'การอัปโหลดถูกยกเลิก',
  'storage/invalid-event-name': 'ชื่อเหตุการณ์ไม่ถูกต้อง',
  'storage/invalid-url': 'URL ไม่ถูกต้อง',
  'storage/invalid-argument': 'ข้อมูลที่ส่งไม่ถูกต้อง',
  'storage/no-default-bucket': 'ไม่มีที่เก็บไฟล์เริ่มต้น',
  'storage/cannot-slice-blob': 'ไม่สามารถแบ่งไฟล์ได้',
  'storage/server-file-wrong-size': 'ขนาดไฟล์ไม่ตรงกับเซิร์ฟเวอร์'
};

// Functions Error Messages
const FUNCTIONS_ERROR_MESSAGES = {
  'functions/ok': 'สำเร็จ',
  'functions/cancelled': 'การดำเนินการถูกยกเลิก',
  'functions/unknown': 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ',
  'functions/invalid-argument': 'ข้อมูลที่ส่งไม่ถูกต้อง',
  'functions/deadline-exceeded': 'การดำเนินการใช้เวลานานเกินกำหนด',
  'functions/not-found': 'ไม่พบฟังก์ชันที่เรียก',
  'functions/already-exists': 'ข้อมูลนี้มีอยู่แล้ว',
  'functions/permission-denied': 'ไม่มีสิทธิ์ในการเรียกใช้ฟังก์ชันนี้',
  'functions/resource-exhausted': 'ทรัพยากรระบบถูกใช้งานเกินกำหนด',
  'functions/failed-precondition': 'เงื่อนไขไม่เป็นไปตามที่กำหนด',
  'functions/aborted': 'การดำเนินการถูกยกเลิก',
  'functions/out-of-range': 'ข้อมูลเกินช่วงที่กำหนด',
  'functions/unimplemented': 'ฟีเจอร์นี้ยังไม่รองรับ',
  'functions/internal': 'เกิดข้อผิดพลาดภายในระบบ',
  'functions/unavailable': 'ระบบไม่พร้อมใช้งานในขณะนี้',
  'functions/data-loss': 'เกิดการสูญหายของข้อมูล',
  'functions/unauthenticated': 'กรุณาเข้าสู่ระบบก่อนใช้งาน'
};

// HTTP Status Code Messages
const HTTP_ERROR_MESSAGES = {
  400: 'ข้อมูลที่ส่งไม่ถูกต้อง',
  401: 'กรุณาเข้าสู่ระบบ',
  403: 'ไม่มีสิทธิ์ในการเข้าถึง',
  404: 'ไม่พบข้อมูลที่ต้องการ',
  408: 'การเชื่อมต่อหมดเวลา',
  409: 'ข้อมูลขัดแย้ง',
  429: 'ใช้งานเกินกำหนด กรุณารอสักครู่',
  500: 'เกิดข้อผิดพลาดภายในระบบ',
  502: 'เซิร์ฟเวอร์ไม่พร้อมใช้งาน',
  503: 'ระบบไม่พร้อมใช้งานชั่วคราว',
  504: 'การเชื่อมต่อหมดเวลา'
};

/**
 * Main Firebase Error Handler Class
 */
class FirebaseErrorHandler {
  /**
   * Interpret any Firebase error and return user-friendly Thai message
   * @param {Error|Object} error - Firebase error object
   * @returns {Object} - { message: string, code: string, severity: string }
   */
  static interpret(error) {
    console.log('🔍 FirebaseErrorHandler - Raw error:', error);
    
    try {
      // Handle different error formats
      let errorCode = '';
      let errorMessage = '';
      let originalError = error;
      
      // Case 1: Standard Firebase Error object
      if (error?.code) {
        errorCode = error.code;
        errorMessage = error.message;
        
        // Special handling for auth/internal-error with JSON message
        if (errorCode === 'auth/internal-error' && errorMessage) {
          try {
            const parsedMessage = JSON.parse(errorMessage);
            if (parsedMessage?.error?.message) {
              // Extract the real error code from the JSON
              errorCode = parsedMessage.error.message;
              errorMessage = parsedMessage.error.message;
              console.log('🔍 Extracted real error from JSON:', errorCode);
            }
          } catch (jsonError) {
            // If JSON parsing fails, keep original error
            console.log('🔍 Could not parse JSON error message');
          }
        }
      }
      // Case 2: HTTP Response error format
      else if (error?.response?.data?.error) {
        const responseError = error.response.data.error;
        errorCode = responseError.message || responseError.code;
        errorMessage = responseError.message;
      }
      // Case 3: Nested error format
      else if (error?.error?.message) {
        errorCode = error.error.message;
        errorMessage = error.error.message;
      }
      // Case 4: Direct error message
      else if (typeof error === 'string') {
        errorCode = error;
        errorMessage = error;
      }
      // Case 5: Error with message property
      else if (error?.message) {
        errorCode = error.message;
        errorMessage = error.message;
      }
      
      console.log('🔍 Extracted error code:', errorCode);
      console.log('🔍 Extracted error message:', errorMessage);
      
      // Get user-friendly message
      const friendlyMessage = this.getFriendlyMessage(errorCode);
      const severity = this.getErrorSeverity(errorCode);
      
      const result = {
        message: friendlyMessage,
        code: errorCode,
        severity,
        originalMessage: errorMessage,
        originalError
      };
      
      console.log('🔍 FirebaseErrorHandler result:', result);
      return result;
      
    } catch (interpreterError) {
      console.error('❌ Error in FirebaseErrorHandler:', interpreterError);
      return {
        message: 'เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ',
        code: 'unknown',
        severity: 'error',
        originalMessage: error?.message || JSON.stringify(error),
        originalError: error
      };
    }
  }
  
  /**
   * Get user-friendly message for error code
   * @param {string} errorCode 
   * @returns {string}
   */
  static getFriendlyMessage(errorCode) {
    // Normalize error code
    const normalizedCode = errorCode?.toLowerCase();
    
    // Check Authentication errors
    if (AUTH_ERROR_MESSAGES[errorCode]) {
      return AUTH_ERROR_MESSAGES[errorCode];
    }
    
    // Check Firestore errors
    if (FIRESTORE_ERROR_MESSAGES[normalizedCode]) {
      return FIRESTORE_ERROR_MESSAGES[normalizedCode];
    }
    
    // Check Storage errors
    if (STORAGE_ERROR_MESSAGES[errorCode]) {
      return STORAGE_ERROR_MESSAGES[errorCode];
    }
    
    // Check Functions errors
    if (FUNCTIONS_ERROR_MESSAGES[errorCode]) {
      return FUNCTIONS_ERROR_MESSAGES[errorCode];
    }
    
    // Check HTTP status codes
    const httpCode = parseInt(errorCode);
    if (HTTP_ERROR_MESSAGES[httpCode]) {
      return HTTP_ERROR_MESSAGES[httpCode];
    }
    
    // Check common patterns
    if (normalizedCode?.includes('network')) {
      return 'เกิดปัญหาการเชื่อมต่อเครือข่าย กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่';
    }
    
    if (normalizedCode?.includes('timeout')) {
      return 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่';
    }
    
    if (normalizedCode?.includes('permission')) {
      return 'ไม่มีสิทธิ์ในการดำเนินการนี้';
    }
    
    if (normalizedCode?.includes('invalid')) {
      return 'ข้อมูลไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
    }
    
    if (normalizedCode?.includes('credential')) {
      return 'ข้อมูลการเข้าสู่ระบบไม่ถูกต้อง';
    }
    
    // Special handling for specific error messages
    if (normalizedCode?.includes('invalid_login_credentials') || 
        normalizedCode?.includes('invalid-login-credentials') ||
        normalizedCode?.includes('invalid_login_credentials')) {
      return 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่';
    }
    
    // Default fallback message
    return 'เกิดข้อผิดพลาด กรุณาลองใหม่หรือติดต่อผู้ดูแลระบบ';
  }
  
  /**
   * Get error severity level
   * @param {string} errorCode 
   * @returns {string}
   */
  static getErrorSeverity(errorCode) {
    const criticalErrors = [
      'internal-error', 'data-loss', 'unknown', 'internal',
      'storage/unknown', 'functions/internal'
    ];
    
    const warningErrors = [
      'network-request-failed', 'timeout', 'unavailable',
      'deadline-exceeded', 'cancelled', 'aborted'
    ];
    
    const infoErrors = [
      'requires-recent-login', 'popup-closed-by-user',
      'storage/canceled'
    ];
    
    if (criticalErrors.includes(errorCode)) return 'critical';
    if (warningErrors.includes(errorCode)) return 'warning';
    if (infoErrors.includes(errorCode)) return 'info';
    
    return 'error'; // default
  }
  
  /**
   * Check if error is a network/connectivity issue
   * @param {string} errorCode 
   * @returns {boolean}
   */
  static isNetworkError(errorCode) {
    const networkErrors = [
      'auth/network-request-failed',
      'auth/timeout',
      'unavailable',
      'deadline-exceeded'
    ];
    
    return networkErrors.includes(errorCode) || 
           errorCode?.includes('network') || 
           errorCode?.includes('timeout');
  }
  
  /**
   * Check if error requires re-authentication
   * @param {string} errorCode 
   * @returns {boolean}
   */
  static requiresReauth(errorCode) {
    const reauthErrors = [
      'auth/user-token-expired',
      'auth/invalid-user-token',
      'auth/requires-recent-login',
      'unauthenticated'
    ];
    
    return reauthErrors.includes(errorCode);
  }
  
  /**
   * Get suggested action for error
   * @param {string} errorCode 
   * @returns {string}
   */
  static getSuggestedAction(errorCode) {
    if (this.isNetworkError(errorCode)) {
      return 'checkNetwork';
    }
    
    if (this.requiresReauth(errorCode)) {
      return 'reauth';
    }
    
    const actionMap = {
      'auth/invalid-email': 'checkEmail',
      'auth/weak-password': 'strengthenPassword',
      'auth/email-already-in-use': 'useExistingAccount',
      'auth/too-many-requests': 'waitAndRetry',
      'permission-denied': 'contactAdmin',
      'quota-exceeded': 'waitAndRetry'
    };
    
    return actionMap[errorCode] || 'retry';
  }
}

export default FirebaseErrorHandler; 