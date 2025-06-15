import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';

// 🚀 Configure dayjs for Ant Design compatibility
import dayjs from 'dayjs';
import 'dayjs/locale/th';
import utc from 'dayjs/plugin/utc';
import timezone from 'dayjs/plugin/timezone';
import relativeTime from 'dayjs/plugin/relativeTime';
import duration from 'dayjs/plugin/duration';
import weekday from 'dayjs/plugin/weekday';
import localeData from 'dayjs/plugin/localeData';
import weekOfYear from 'dayjs/plugin/weekOfYear';
import weekYear from 'dayjs/plugin/weekYear';
import advancedFormat from 'dayjs/plugin/advancedFormat';
import customParseFormat from 'dayjs/plugin/customParseFormat';

import App from './App';
import * as serviceWorker from './serviceWorker';
import { notification, message } from 'antd';

// Extend dayjs with all necessary plugins for Ant Design compatibility
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(relativeTime);
dayjs.extend(duration);
dayjs.extend(weekday);
dayjs.extend(localeData);
dayjs.extend(weekOfYear);
dayjs.extend(weekYear);
dayjs.extend(advancedFormat);
dayjs.extend(customParseFormat);

// Set Thai locale as default
dayjs.locale('th');

// Configure antd notifications to appear above navigation
notification.config({
  top: 24,
  duration: 4.5,
  maxCount: 3,
  rtl: false,
  prefixCls: 'ant-notification',
  getContainer: () => document.body,
});

// Configure antd message to appear above navigation with proper z-index
message.config({
  top: 24,
  duration: 4.5,
  maxCount: 3,
  rtl: false,
  prefixCls: 'ant-message',
  getContainer: () => document.body,
});

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
