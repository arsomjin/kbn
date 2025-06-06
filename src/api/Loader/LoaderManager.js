module.exports = {
  _currentLoader: null,
  registerLoader(Loader) {
    this._currentLoader = Loader;
    // showLog('currentLoader', this._currentLoader);
  },
  unregisterLoader() {
    this._currentLoader = null;
  },
  showLoader(newState = null) {
    if (this._currentLoader === null) {
      return;
    }

    if (newState !== null) {
      this._currentLoader.showLoad(newState);
    }
  },
  hideLoader() {
    if (this._currentLoader !== null) {
      // Delay to prevent async event
      setTimeout(() => {
        this._currentLoader.hideLoad();
      }, 100);
    }
  }
};
