import { ProgressRef } from './Progress';

interface ProgressState {
  show?: boolean;
  percent?: number;
  text?: string;
  subtext?: string;
  onCancel?: () => void;
}

interface ProgressManagerType {
  _currentProgress: ProgressRef | null;
  registerProgress: (progress: ProgressRef) => void;
  unregisterProgress: () => void;
  showProgress: (newState?: Partial<ProgressState> | null) => void;
  hideProgress: () => void;
}

const ProgressManager: ProgressManagerType = {
  _currentProgress: null,

  registerProgress(progress: ProgressRef) {
    this._currentProgress = progress;
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