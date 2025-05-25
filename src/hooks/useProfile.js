import { useEffect, useMemo, useState } from 'react';

import { collection, query, onSnapshot } from 'firebase/firestore';
import { firestore as db } from 'services/firebase';

export const useProfile = (uid) => {
  const [profile, setProfile] = useState(null);
  useEffect(() => {
    const q = query(collection(db, `users/${uid}/info`));
    const unsubscribe = onSnapshot(q, (querySnapshot) => {
      querySnapshot.forEach((doc) => {
        setProfile(doc.data());
      });
    });
    return () => unsubscribe?.();
  }, [uid]);
  return useMemo(() => profile, [profile]);
};
