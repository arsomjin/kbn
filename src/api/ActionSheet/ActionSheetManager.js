module.exports = {
  _currentActionSheet: null,
  registerActionSheet(ActionSheet) {
    this._currentActionSheet = ActionSheet;
  },
  unregisterActionSheet() {
    this._currentActionSheet = null;
  },
  showActionSheet(newState = null) {
    console.log('NEW_STATE', newState);
    if (this._currentActionSheet === null) {
      return;
    }

    if (newState !== null) {
      this._currentActionSheet.showActionSheet(newState);
    }
  },
  hideActionSheet() {
    if (this._currentActionSheet !== null) {
      this._currentActionSheet.hideActionSheet();
    }
  }
};
