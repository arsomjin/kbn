import { useState } from 'react';
import { shallowPartialCompare } from 'utils/common';

export const useMergeState = (initial) => {
  const [state, setState] = useState(initial);
  const setMergedState = (newIncomingState) =>
    setState((prevState) => {
      const newState =
        typeof newIncomingState === 'function' ? newIncomingState(prevState) : newIncomingState;
      return shallowPartialCompare(prevState, newState) ? prevState : { ...prevState, ...newState };
    });
  return [state, setMergedState];
};
