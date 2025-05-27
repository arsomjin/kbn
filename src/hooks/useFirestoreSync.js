import { useState, useEffect } from 'react';
import { collection, onSnapshot, query } from 'firebase/firestore';
import { firestore as db } from 'services/firebase';
import { message } from 'antd';
import { useDispatch } from 'react-redux';

import { processFirestoreDataForForm } from '../utils/dateHandling';

/**
 * useFirestoreSync - A hook for syncing Firestore collections with Redux
 * @param {string} collectionPath - Firestore collection path
 * @param {Function} setReduxAction - Redux action creator for setting data (e.g., setProvinces)
 * @param {Array} queryConstraints - Additional query constraints
 * @param {boolean} enabled - Whether to enable the listener (default: true)
 * @returns {Object} { loading, error }
 */
const useFirestoreSync = (
  collectionPath,
  setReduxAction,
  queryConstraints = [],
  enabled = true,
) => {
  const dispatch = useDispatch();
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Debug: warn if queryConstraints is not memoized
  if (queryConstraints && typeof queryConstraints === 'object' && queryConstraints.length > 0) {
    console.warn(
      '[useFirestoreSync] queryConstraints should be memoized to prevent re-renders:',
      collectionPath,
      queryConstraints,
    );
  }

  useEffect(() => {
    if (!enabled) {
      setLoading(false);
      setError(null);
      return;
    }
    // console.log('[useFirestoreSync] Setting up listener for', collectionPath, 'enabled:', enabled);
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
              data[doc.id] = processFirestoreDataForForm({ ...doc.data(), _key: doc.id });
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

    // Cleanup function
    return () => {
      // console.log('[useFirestoreSync] Cleaning up listener for', collectionPath);
      unsubscribe();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [collectionPath, setReduxAction, queryConstraints, enabled]);

  return { loading: enabled ? loading : false, error: enabled ? error : null };
};

export default useFirestoreSync;
