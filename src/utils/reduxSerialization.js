import { serializeTimestampsDeep } from './timestampUtils';

/**
 * Creates a serialized version of a reducer that automatically handles Firestore Timestamps
 * @param {Function} reducer - The original reducer function
 * @returns {Function} - A new reducer that serializes Timestamps before updating state
 */
export const createSerializedReducer = (reducer) => {
  return (state, action) => {
    // Ensure we have a valid action with a type
    if (!action || typeof action !== 'object' || !('type' in action)) {
      return state;
    }

    // Handle the case where payload is undefined
    if (!('payload' in action)) {
      return reducer(state, action);
    }

    try {
      // If action.payload is an array (like [data, isPartial]), serialize the first element
      if (Array.isArray(action.payload) && action.payload.length > 0) {
        const serializedPayload = [
          serializeTimestampsDeep(action.payload[0]),
          ...action.payload.slice(1),
        ];
        return reducer(state, { ...action, payload: serializedPayload });
      }

      // Otherwise serialize the entire payload
      const serializedPayload = serializeTimestampsDeep(action.payload);
      return reducer(state, { ...action, payload: serializedPayload });
    } catch (error) {
      console.error('Error in serialized reducer:', error);
      // Fallback to original reducer if serialization fails
      return reducer(state, action);
    }
  };
};

/**
 * Creates a serialized version of an async thunk that automatically handles Firestore Timestamps
 * @param {Function} thunk - The original async thunk function
 * @returns {Function} - A new thunk that serializes Timestamps in the result
 */
export const createSerializedThunk = (thunk) => {
  return async (...args) => {
    try {
      const result = await thunk(...args);
      if (result && typeof result === 'object' && 'payload' in result) {
        result.payload = serializeTimestampsDeep(result.payload);
      }
      return result;
    } catch (error) {
      console.error('Error in serialized thunk:', error);
      throw error;
    }
  };
};
