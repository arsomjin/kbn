import { useState, useEffect } from 'react';
import { onSnapshot, collection, query, where, orderBy } from 'firebase/firestore';
import { db } from 'services/firebase';
import { message } from 'antd';

/**
 * useFirestoreListener - A reusable Firestore listener hook
 * @param {string} collectionPath - Firestore collection path
 * @param {Array} queryConstraints - Firestore query constraints
 * @returns {Object} { data, loading, error }
 */
export function useFirestoreListener(collectionPath, queryConstraints = []) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionPath) {
      setError('Invalid Firestore collection path.');
      setLoading(false);
      return;
    }

    setLoading(true);
    const q = query(collection(db, collectionPath), ...queryConstraints, orderBy('createdAt'));
    const unsubscribe = onSnapshot(
      q,
      (snapshot) => {
        setData(snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() })));
        setLoading(false);
      },
      (err) => {
        console.error('Firestore listener error:', err);
        setError(err);
        message.error('Error fetching Firestore data.');
        setLoading(false);
      },
    );

    return () => unsubscribe(); // Cleanup on unmount
  }, [collectionPath, JSON.stringify(queryConstraints)]);

  return { data, loading, error };
}
