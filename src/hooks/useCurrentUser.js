import { useEffect, useMemo, useState } from 'react';
import { getAuth, onAuthStateChanged } from 'firebase/auth';

export const useCurrentUser = () => {
  const auth = getAuth();
  const [currentUser, setCurrentUser] = useState(null);
  useEffect(() => {
    const listener = onAuthStateChanged(auth, (user) => {
      setCurrentUser(user);
    });
    return () => listener?.();
  }, [auth]);
  return useMemo(() => currentUser, [currentUser]);
};
