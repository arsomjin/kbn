module.exports = {
  _currentProgress: null,
  registerProgress(Progress) {
    this._currentProgress = Progress;
    // showLog('currentProgress', this._currentProgress);
  },
  unregisterProgress() {
    this._currentProgress = null;
  },
  showProgress(newState = null) {
    if (this._currentProgress === null) {
      return;
    }

    if (newState !== null) {
      this._currentProgress.showProgress(newState);
    }
  },
  hideProgress() {
    if (this._currentProgress !== null) {
      // Delay to prevent async event
      setTimeout(() => {
        this._currentProgress.hideProgress();
      }, 100);
    }
  }
};
