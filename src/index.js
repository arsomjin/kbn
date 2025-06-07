import React from 'react';
import ReactDOM from 'react-dom';
// import './index.css';
import App from './App';
import * as serviceWorker from './serviceWorker';
import { notification } from 'antd';

// Configure antd notifications to appear above navigation
notification.config({
  top: 24,
  duration: 4.5,
  maxCount: 3,
  rtl: false,
  prefixCls: 'ant-notification',
  getContainer: () => document.body,
});

ReactDOM.render(<App />, document.getElementById('root'));

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
