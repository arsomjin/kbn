import { ProgressRef } from './Progress';

interface ProgressManagerType {
  _currentProgress: ProgressRef | null;
  registerProgress: (Progress: ProgressRef) => void;
  unregisterProgress: () => void;
  showProgress: (newState?: {
    show?: boolean;
    percent?: number;
    text?: string;
    subtext?: string;
    onCancel?: () => void;
  } | null) => void;
  hideProgress: () => void;
}

const ProgressManager: ProgressManagerType = {
  _currentProgress: null,

  registerProgress(Progress: ProgressRef) {
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
        this._currentProgress?.hideProgress();
      }, 100);
    }
  }
};

export default ProgressManager;
