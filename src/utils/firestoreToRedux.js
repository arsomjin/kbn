import { serializeTimestampsDeep } from './timestampUtils';

/**
 * Helper to dispatch Firestore data to Redux with all Timestamps serialized.
 * Usage: useFirestoreSync('collection', dispatchFirestoreData(dispatch, setAction))
 */
export function dispatchFirestoreData(dispatch, actionCreator) {
  return (payload) => {
    // If payload is an array (like [data, isPartial]), serialize the first element
    if (Array.isArray(payload) && payload.length > 0 && typeof payload[0] === 'object') {
      const serializable = [serializeTimestampsDeep(payload[0]), ...payload.slice(1)];
      dispatch(actionCreator(serializable));
    } else {
      dispatch(actionCreator(serializeTimestampsDeep(payload)));
    }
  };
}
