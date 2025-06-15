/**
 * Test utility for the notification enable button
 * This helps verify that the new "เปิดการแจ้งเตือน" button works correctly
 */

import { requestPermission } from '../api/NotificationsUnified';

// Test function to trigger the notification warning with enable button
export const testNotificationEnableButton = async () => {
  console.log('🧪 Testing notification enable button...');

  try {
    // Force the warning to show by resetting the warning flag
    // In the actual code, this is handled by the warningShown variable
    const permission = await requestPermission();

    console.log('📋 Test Results:', {
      permission,
      message: 'Check if the notification warning appeared with enable button',
      expectedButtons: ['เปิดการแจ้งเตือน', 'ปิด'],
      expectedBehavior: {
        เปิดการแจ้งเตือน:
          'Should request permission and show success/error message',
        ปิด: 'Should close the notification without requesting permission',
      },
    });

    return permission;
  } catch (error) {
    console.error('❌ Test failed:', error);
    return false;
  }
};

// Check current notification status
export const checkNotificationStatus = () => {
  const status = {
    browserSupported: 'Notification' in window,
    currentPermission: Notification.permission,
    canRequestPermission: Notification.permission !== 'denied',
  };

  console.log('🔍 Current Notification Status:', status);

  return status;
};

// Manual test scenarios
export const runNotificationTests = () => {
  console.log('🚀 Running notification tests...');

  // Test 1: Check browser support
  console.log(
    'Test 1 - Browser Support:',
    'Notification' in window ? '✅ Supported' : '❌ Not Supported'
  );

  // Test 2: Check current permission
  console.log('Test 2 - Current Permission:', Notification.permission);

  // Test 3: Test the warning message (only if permission is not granted)
  if (Notification.permission !== 'granted') {
    console.log(
      'Test 3 - Warning Message: Will trigger when requestPermission() is called'
    );
    console.log('Expected behavior:');
    console.log('  - Warning notification should appear');
    console.log('  - Should contain "เปิดการแจ้งเตือน" and "ปิด" buttons');
    console.log('  - Duration should be 0 (persistent until user interacts)');
  } else {
    console.log(
      'Test 3 - Warning Message: ⏭️ Skipped (permission already granted)'
    );
  }

  return checkNotificationStatus();
};

// Usage guide
export const showUsageGuide = () => {
  console.log(`
🎯 Notification Enable Button Test Guide

1. Open browser console
2. Run: import { testNotificationEnableButton } from 'utils/test-notification-enable-button'
3. Run: testNotificationEnableButton()
4. Check if warning notification appears with buttons
5. Test both buttons:
   - "เปิดการแจ้งเตือน": Should request permission
   - "ปิด": Should close notification

Expected Flow:
1. User sees "การแจ้งเตือน ถูกปิดอยู่" warning
2. Clicks "เปิดการแจ้งเตือน" button
3. Browser shows permission dialog
4. If granted: Shows success message
5. If denied: Shows error message with instructions
6. Warning notification closes automatically

Note: To reset and test again, clear browser permissions for this site.
  `);
};

export default {
  testNotificationEnableButton,
  checkNotificationStatus,
  runNotificationTests,
  showUsageGuide,
};
