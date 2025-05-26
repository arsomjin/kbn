import { useState } from 'react';

/**
 * A hook that merges state updates with the previous state, similar to setState in class components.
 * Only updates state if the new values are different from the previous state.
 *
 * @param {Object} initialState - The initial state value
 * @returns {[Object, Function]} A tuple containing the current state and a function to update it
 *
 * @example
 * const [state, setState] = useMergeState({ count: 0, text: '' });
 * setState({ count: 1 }); // Only updates count
 * setState(prev => ({ count: prev.count + 1 })); // Functional update
 */
export function useMergeState(initialState) {
  const [state, setState] = useState(initialState);

  const setMergedState = (newState) => {
    setState((prevState) => {
      const nextState = typeof newState === 'function' ? newState(prevState) : newState;

      // Check if any values have actually changed
      const hasChanges = Object.entries(nextState).some(([key, value]) => prevState[key] !== value);

      return hasChanges ? { ...prevState, ...nextState } : prevState;
    });
  };

  return [state, setMergedState];
}
