import React, { Fragment } from 'react';
import { useSelector } from 'react-redux';

import {
  // MessageBar,
  // Snackbar,
  ActionSheet,
  MessageBar,
  AlertDialog,
  Loader,
  Progressor,
  // Updater,
  // DialogSheet,
  Success,
  // PinCode,
  NoWifi,
  NetworkStatusIndicator,
  Printer
} from '../elements';

const EventEmitter = () => {
  const { networkStatus } = useSelector(state => state.global);

  return (
    <Fragment>
      {/* <PinCode /> */}
      <Printer />
      <ActionSheet />
      <Loader />
      <Progressor />
      <MessageBar />
      <AlertDialog />
      <Success />
      {/* <DialogSheet />
      <Updater />
      <Snackbar style={styles.snack} />
      <MessageBar />*/}
      
      {/* Enhanced Network Status Component */}
      {networkStatus.enabled && (
        <NetworkStatusIndicator
          detailedStatus={networkStatus.detailedStatus}
          showRetryButton={networkStatus.showRetryButton}
          autoRetry={networkStatus.autoRetry}
          enableQualityCheck={networkStatus.enableQualityCheck}
          showWhenOnline={networkStatus.showWhenOnline}
          retryInterval={networkStatus.retryInterval}
        />
      )}
      
      {/* Fallback to original component if enhanced is disabled */}
      {!networkStatus.enabled && <NoWifi />}
    </Fragment>
  );
};

export default EventEmitter;
