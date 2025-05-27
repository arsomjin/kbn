// Progress API for managing progress states
import { useState, useCallback } from 'react';

/**
 * Progress manager class for handling progress states
 */
export class ProgressManager {
  constructor() {
    this.progressStates = new Map();
    this.listeners = new Set();
  }

  setProgress(key, value) {
    this.progressStates.set(key, value);
    this.notifyListeners();
  }

  getProgress(key) {
    return this.progressStates.get(key) || 0;
  }

  removeProgress(key) {
    this.progressStates.delete(key);
    this.notifyListeners();
  }

  addListener(listener) {
    this.listeners.add(listener);
  }

  removeListener(listener) {
    this.listeners.delete(listener);
  }

  notifyListeners() {
    this.listeners.forEach((listener) => listener());
  }
}

// Global progress manager instance
export const progressManager = new ProgressManager();

/**
 * Progress hook for components
 * @param {string} key - Progress key identifier
 * @returns {Object} Progress state and setter
 */
export const useProgress = (key) => {
  const [progress, setProgressState] = useState(0);

  const setProgress = useCallback(
    (value) => {
      progressManager.setProgress(key, value);
      setProgressState(value);
    },
    [key],
  );

  const clearProgress = useCallback(() => {
    progressManager.removeProgress(key);
    setProgressState(0);
  }, [key]);

  return {
    progress,
    setProgress,
    clearProgress,
  };
};

/**
 * Progress component for displaying progress
 */
export const Progress = {
  manager: progressManager,
  useProgress,
};
