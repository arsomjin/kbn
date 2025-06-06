module.exports = {
  _currentMessageBar: null,
  registerMessageBar(MessageBar) {
    this._currentMessageBar = MessageBar;
    // showLog('currentMessageBar', this._currentMessageBar);
  },
  unregisterMessageBar() {
    this._currentMessageBar = null;
  },
  showMessageBar(newState = null) {
    if (this._currentMessageBar === null) {
      return;
    }

    if (newState !== null) {
      this._currentMessageBar.showMessageBar(newState);
    }
  },
  hideMessageBar() {
    if (this._currentMessageBar !== null) {
      // Delay to prevent async event
      setTimeout(() => {
        this._currentMessageBar.hideMessageBar();
      }, 100);
    }
  }
};
