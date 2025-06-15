import React, { useState, useEffect } from 'react';
import firebase from 'firebase/app';
import 'firebase/messaging';
import { notification, Button } from 'antd';
import moment from 'moment';
import { isMobile } from 'react-device-detect';
import parse from 'html-react-parser';
import { showLog, showWarn, Numb } from 'functions';

let warningShown = false;

// Request permission for notifications
export const requestPermission = async () => {
  try {
    const req = await Notification.requestPermission();
    if (req !== 'granted' && !warningShown) {
      notification.warning({
        message: 'การแจ้งเตือน ถูกปิดอยู่',
        description: 'กรุณาเปิดรับการแจ้งเตือน ที่การตั้งค่าเบราเซอร์',
        duration: 0, // Keep the notification open until user interacts
        top: isMobile ? 38 : 76,
        btn: (
          <div style={{ marginTop: '8px', display: 'flex', gap: '8px' }}>
            <Button
              type='primary'
              size='small'
              onClick={async () => {
                try {
                  const permission = await Notification.requestPermission();
                  if (permission === 'granted') {
                    notification.success({
                      message: 'การแจ้งเตือนเปิดแล้ว!',
                      description: 'คุณจะได้รับการแจ้งเตือนจากระบบ',
                      duration: 3,
                      top: isMobile ? 38 : 76,
                    });
                    warningShown = false; // Reset so it can show again if needed
                  } else if (permission === 'denied') {
                    notification.error({
                      message: 'การแจ้งเตือนถูกปฏิเสธ',
                      description: 'กรุณาเปิดการแจ้งเตือนในการตั้งค่าเบราเซอร์',
                      duration: 5,
                      top: isMobile ? 38 : 76,
                    });
                  }
                  notification.destroy(); // Close the warning notification
                } catch (error) {
                  console.error(
                    'Error requesting notification permission:',
                    error
                  );
                  notification.error({
                    message: 'เกิดข้อผิดพลาด',
                    description: 'ไม่สามารถเปิดการแจ้งเตือนได้ กรุณาลองใหม่',
                    duration: 3,
                    top: isMobile ? 38 : 76,
                  });
                }
              }}
              style={{ fontSize: '12px', height: '28px' }}
            >
              เปิดการแจ้งเตือน
            </Button>
            <Button
              size='small'
              onClick={() => notification.destroy()}
              style={{ fontSize: '12px', height: '28px' }}
            >
              ปิด
            </Button>
          </div>
        ),
      });
      warningShown = true;
    }
    return req;
  } catch (e) {
    showWarn(e);
    throw e;
  }
};

// Initialize notifications: check permission, get token, and register token via your API
export const initNotification = async (api, mUser) => {
  try {
    const notifPermission = await requestPermission();
    if (notifPermission !== 'granted') {
      showWarn('Notification permission not granted');
      return false;
    }
    const notificationToken = await api.getMessagingToken();
    await api.setMessageToken(notificationToken, mUser);
    return true;
  } catch (e) {
    showWarn(e);
    throw e;
  }
};

// Display a notification using antd's notification component
export const openNotification = (notif) => {
  notification[notif.type || 'info']({
    ...notif,
    ...((notif.duration || notif.duration === '0') && {
      duration: Numb(notif.duration),
    }),
    top: isMobile ? 38 : 76,
    description: (
      <div className='notification__content'>
        <span className='text-light text-muted' style={{ fontSize: 12 }}>
          {moment(Numb(notif.time)).format('lll')}
        </span>
        {parse(`${notif.description}`)}
        {notif.link && (
          <a href={notif.link} target='_blank' rel='noopener noreferrer'>
            {notif.link}
          </a>
        )}
      </div>
    ),
  });
};

// Compose and send a notification via your API
export const composeNotification = async (api, notif, disableAutoClose) => {
  try {
    // notif = {
    //     message: 'ทดสอบการแจ้งเตือน',
    //     description: 'สมุทรปราการ โป๊ะแตก วันเดียวพบติดเชื้อโควิดใหม่ 20 ราย แบ่งเป็นคลัสเตอร์จากโรงงานย่านพระสมุทรเจดีย์ 11 ราย - ผับย่านทองหล่อ 9 ราย เร่งสอบสวนโรค - คัดกรองกลุ่มเสี่ยง - เช็กไทม์ไลน์ผู้ป่วย...',
    //     duration: '0',
    //     type: 'info' 'warning' 'success' 'error',
    //     branch: '1002',
    //     department: 'dep0003',
    //     group: group001',
    //     by: user.uid,
    //     time: Date.now().toString(),
    //     link: 'https://www.dailynews.co.th/regional/835737',
    //   },
    await api.addItem(
      {
        ...notif,
        ...(disableAutoClose && { duration: '0' }),
        time: Date.now().toString(),
      },
      'messages'
    );
  } catch (e) {
    showWarn(e);
  }
};

// Register the service worker and subscribe for push notifications
export async function registerPush(vapidKey) {
  try {
    await navigator.serviceWorker.register('/firebase-messaging-sw.js');
    const registration = await navigator.serviceWorker.ready;
    const messaging = firebase.messaging();
    const token = await messaging.getToken({
      vapidKey,
      serviceWorkerRegistration: registration,
    });
    return token;
  } catch (error) {
    console.error('Failed to subscribe to push', error);
    throw error;
  }
}

// Hook to initialize notifications and listen for foreground messages
export const useNotificationListener = (api, mUser) => {
  const [data, setData] = useState({
    error: null,
    loading: true,
    data: null,
  });

  useEffect(() => {
    let unsubscribe;
    const handleNotification = async () => {
      try {
        const isInitialized = await initNotification(api, mUser);
        if (!isInitialized) {
          setData({ error: null, loading: false, data: null });
          return;
        }
        const messaging = firebase.messaging();
        unsubscribe = messaging.onMessage((payload) => {
          showLog('Foreground notification received:', payload);
          if (payload && payload.data) {
            openNotification(payload.data);
            setData({ data: payload.data, loading: false, error: null });
          }
        });
      } catch (error) {
        console.error('Notification listener error:', error);
        setData({ error, loading: false, data: null });
      }
    };
    handleNotification();
    return () => {
      if (unsubscribe) unsubscribe();
    };
  }, [api, mUser]);
  return data;
};
