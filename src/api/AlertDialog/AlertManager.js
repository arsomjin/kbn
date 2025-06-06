module.exports = {
  _currentAlert: null,
  registerAlert(Alert) {
    this._currentAlert = Alert;
    // showLog('currentAlert', this._currentAlert);
  },
  unregisterAlert() {
    this._currentAlert = null;
  },
  showAlert(newState = null) {
    if (this._currentAlert === null) {
      return;
    }

    if (newState !== null) {
      this._currentAlert.showAlert(newState);
    }
  },
  hideAlert() {
    if (this._currentAlert !== null) {
      // Delay to prevent async event
      setTimeout(() => {
        this._currentAlert.hideAlert();
      }, 100);
    }
  }
};
