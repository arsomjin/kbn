module.exports = {
  _currentSuccess: null,
  registerSuccess(Success) {
    this._currentSuccess = Success;
  },
  unregisterSuccess() {
    this._currentSuccess = null;
  },
  showSuccess(newState = null) {
    console.log('NEW_STATE', newState);
    if (this._currentSuccess === null) {
      return;
    }

    // Hide the current alert
    // this.hideSuccess();
    if (newState !== null) {
      // Clear current state
      // this._currentSuccess.setNewState({});

      // this._currentSuccess.setNewState(newState);
      this._currentSuccess.showSuccess(newState);
      // setTimeout(() => {
      //   this._currentSuccess.showSuccess();
      // }, 100);
    }
  },
  hideSuccess() {
    if (this._currentSuccess !== null) {
      this._currentSuccess.hideSuccess();
    }
  }
};
