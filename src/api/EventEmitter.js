import React, { Fragment } from 'react';

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
  Printer
} from '../elements';

const EventEmitter = () => {
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
      <NoWifi />
    </Fragment>
  );
};

export default EventEmitter;
