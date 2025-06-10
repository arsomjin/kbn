# Firebase Error Handling Implementation

## Overview

Comprehensive user-friendly error handling system for the KBN authentication system, replacing raw Firebase error messages with Thai language error messages that users can understand.

## Problem Solved

**Before**: Users would see raw Firebase error messages like:

```json
{
  "error": {
    "code": 400,
    "message": "INVALID_LOGIN_CREDENTIALS",
    "errors": [
      {
        "message": "INVALID_LOGIN_CREDENTIALS",
        "domain": "global",
        "reason": "invalid"
      }
    ]
  }
}
```

**After**: Users now see user-friendly Thai messages like:

```
อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่
```

## System Architecture

### Core Components

1. **`FirebaseErrorHandler`** (`src/utils/firebaseErrorHandler.js`)

   - Comprehensive error interpretation utility
   - Maps Firebase error codes to Thai messages
   - Handles multiple error formats (JSON, objects, strings)
   - Provides error severity levels and suggested actions

2. **`useFirebaseError`** Hook (`src/hooks/useFirebaseError.js`)

   - React hook for error state management
   - Toast notifications with appropriate severity
   - Error clearing and display utilities
   - Integration with FirebaseErrorHandler

3. **Enhanced Authentication Components**
   - `NatureLogin.js` - Login form with error handling
   - `EnhancedSignUp.js` - Registration form with error handling
   - `ForgetPassword.js` - Password reset with error handling

## Implementation Details

### Error Message Categories

#### Authentication Errors

```javascript
'auth/invalid-login-credentials': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่'
'INVALID_LOGIN_CREDENTIALS': 'อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่'
'auth/user-not-found': 'ไม่พบผู้ใช้งานด้วยอีเมลนี้ กรุณาตรวจสอบอีเมลหรือลงทะเบียนใหม่'
'auth/wrong-password': 'รหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่'
'auth/email-already-in-use': 'อีเมลนี้ถูกใช้งานแล้ว กรุณาใช้อีเมลอื่นหรือเข้าสู่ระบบ'
'auth/weak-password': 'รหัสผ่านไม่ปลอดภัย กรุณาใช้รหัสผ่านที่มีความยาวอย่างน้อย 6 ตัวอักษร'
'auth/too-many-requests': 'มีการพยายามเข้าสู่ระบบมากเกินไป กรุณารอสักครู่แล้วลองใหม่'
```

#### Network Errors

```javascript
'auth/network-request-failed': 'เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย กรุณาตรวจสอบอินเทอร์เน็ตและลองใหม่'
'auth/timeout': 'การเชื่อมต่อหมดเวลา กรุณาลองใหม่'
```

#### Firestore Errors

```javascript
'permission-denied': 'ไม่มีสิทธิ์ในการเข้าถึงข้อมูลนี้'
'unauthenticated': 'กรุณาเข้าสู่ระบบก่อนใช้งาน'
'unavailable': 'ระบบไม่พร้อมใช้งานในขณะนี้'
```

### Error Severity Levels

1. **Critical** (`critical`): System failures, data loss
2. **Error** (`error`): Authentication failures, permission issues (default)
3. **Warning** (`warning`): Network issues, timeouts
4. **Info** (`info`): Re-authentication required, user actions

### Error Handling Flow

```
Firebase Error → FirebaseErrorHandler.interpret() → User-friendly Thai message → useFirebaseError Hook → UI Display
```

## Component Integration

### Updated Authentication Actions

All Redux auth actions now use `FirebaseErrorHandler.interpret()`:

```javascript
// Before
const errorMsg = getAuthErrorMessage(error);
dispatch(loginError(errorMsg));

// After
const errorInfo = FirebaseErrorHandler.interpret(error);
dispatch(loginError(errorInfo.message));
```

### Component Usage Pattern

```javascript
import useFirebaseError from "../../hooks/useFirebaseError";

const MyComponent = () => {
  const { signUpError } = useSelector((state) => state.auth);
  const { error, handleError, clearError } = useFirebaseError();

  useEffect(() => {
    if (signUpError) {
      // Parse JSON error if it's a string
      let parsedError = signUpError;
      if (typeof signUpError === "string" && signUpError.startsWith("{")) {
        try {
          parsedError = JSON.parse(signUpError);
        } catch {
          parsedError = { message: signUpError };
        }
      }

      handleError(parsedError, { showMessage: false }); // Don't show toast, we'll show in form
    } else {
      clearError();
    }
  }, [signUpError, handleError, clearError]);

  return (
    <div>
      {error && (
        <Alert
          message="เกิดข้อผิดพลาด"
          description={error.message}
          type="error"
          showIcon
        />
      )}
    </div>
  );
};
```

## Features

### 1. Multi-format Error Parsing

- Handles JSON string errors
- Parses nested error objects
- Supports different Firebase error structures
- Graceful fallback for unknown formats

### 2. Pattern Matching

Smart error code detection:

```javascript
if (
  normalizedCode?.includes("invalid_login_credentials") ||
  normalizedCode?.includes("invalid-login-credentials") ||
  normalizedCode?.includes("invalid_login_credentials")
) {
  return "อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาตรวจสอบและลองใหม่";
}
```

### 3. Toast Notifications

Automatic toast notifications with severity-based duration:

- Critical errors: 8 seconds
- Warning errors: 6 seconds
- Info messages: 4 seconds
- Regular errors: 6 seconds

### 4. Suggested Actions

Context-aware action suggestions:

- `checkNetwork`: Network issues
- `reauth`: Re-authentication required
- `checkEmail`: Email format issues
- `waitAndRetry`: Rate limiting
- `contactAdmin`: Permission issues

## Files Modified

### Core Infrastructure

- `src/utils/firebaseErrorHandler.js` - Enhanced error mappings
- `src/hooks/useFirebaseError.js` - Already existed, now used throughout
- `src/redux/actions/auth.js` - Updated to use FirebaseErrorHandler

### Authentication Components

- `src/Modules/Auth/NatureLogin.js` - Login error handling
- `src/Modules/Auth/EnhancedSignUp.js` - Registration error handling
- `src/Modules/Auth/ForgetPassword.js` - Password reset error handling

## Benefits

1. **User Experience**: Clear, actionable error messages in Thai
2. **Maintainability**: Centralized error handling logic
3. **Consistency**: Uniform error display across all auth components
4. **Debugging**: Detailed error logging while showing user-friendly messages
5. **Accessibility**: Appropriate ARIA labels and semantic error display

## Testing

Build completed successfully with only minor linting warnings. The error handling system is ready for production use.

## Future Enhancements

1. **Additional Error Codes**: Expand coverage for new Firebase features
2. **Localization**: Support for multiple languages beyond Thai
3. **Analytics**: Track error patterns for system improvements
4. **Retry Logic**: Automatic retry for transient errors
5. **Offline Handling**: Enhanced offline error scenarios
