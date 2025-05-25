import { useState, useEffect } from 'react';
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore';
import { db } from 'services/firebase';
import { message } from 'antd';

/**
 * useFirestoreCollection - A reusable Firestore data fetching hook
 * @param {string} collectionPath - Firestore collection path
 * @param {Array} queryConstraints - Firestore query constraints
 * @param {string} orderByField - Field to order results by
 * @param {string} orderDirection - Sort direction ('asc' or 'desc')
 * @returns {Object} { data, loading, error }
 */
export function useFirestoreCollection(
  collectionPath,
  queryConstraints = [],
  orderByField = 'createdAt',
  orderDirection = 'desc',
) {
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

    const fetchData = async () => {
      try {
        const q = query(
          collection(db, collectionPath),
          ...queryConstraints,
          orderBy(orderByField, orderDirection),
        );
        const querySnapshot = await getDocs(q);
        const docsData = querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
        setData(docsData);
      } catch (err) {
        console.error('Firestore fetch error:', err);
        setError(err);
        message.error('Error fetching Firestore data.');
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [collectionPath, JSON.stringify(queryConstraints), orderByField, orderDirection]);

  return { data, loading, error };
}
