import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { firestore as db } from 'services/firebase';
import { message } from 'antd';
import { useDispatch } from 'react-redux';
import { serializeTimestampsDeep } from 'utils/timestampUtils';

/**
 * useFirestoreSync - A hook for syncing Firestore collections with Redux
 * @param {string} collectionPath - Firestore collection path
 * @param {Function} setReduxAction - Redux action creator for setting data (e.g., setProvinces)
 * @param {Array} queryConstraints - Additional query constraints
 * @returns {Object} { loading, error }
 */
const useFirestoreSync = (collectionPath, setReduxAction, queryConstraints = []) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug: warn if queryConstraints is not memoized
  if (queryConstraints && typeof queryConstraints === 'object' && queryConstraints.length > 0) {
    const isMemoized =
      Object.isFrozen(queryConstraints) ||
      Object.getPrototypeOf(queryConstraints) === Array.prototype;
    if (!isMemoized) {
      console.warn(
        '[useFirestoreSync] queryConstraints is not memoized. This may cause multiple listeners:',
        queryConstraints,
      );
    }
  }

  useEffect(() => {
    // console.log('[useFirestoreSync] Mounting FirestoreSync for', collectionPath);
    if (!collectionPath || !setReduxAction) {
      setError('Invalid Firestore collection path or action creator.');
      setLoading(false);
      return;
    }

    setLoading(true);
    const collectionRef = collection(db, collectionPath);
    const q = query(collectionRef, ...queryConstraints);

    // Set up real-time listener
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        try {
          const data = {};
          snapshot.forEach((doc) => {
            if (doc.exists()) {
              // Serialize each document's data before adding to the collection
              data[doc.id] = serializeTimestampsDeep({ ...doc.data(), _key: doc.id });
            }
          });

          // Dispatch the serialized data
          dispatch(setReduxAction([data, false]));
        } catch (err) {
          console.error('Error processing Firestore data:', err);
          setError(err);
          message.error('Error processing Firestore data.');
        } finally {
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error in useFirestoreSync:', error);
        setError(error);
        message.error('Error syncing Firestore data.');
        setLoading(false);
      },
    );

    // Debug: log unsubscribe
    return () => {
      // console.log('[useFirestoreSync] Unsubscribing FirestoreSync for', collectionPath);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionPath, queryConstraints]);

  return { loading, error };
};

export default useFirestoreSync;
