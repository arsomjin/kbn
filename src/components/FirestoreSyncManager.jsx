import React, { useMemo } from 'react';
import useFirestoreSync from 'hooks/useFirestoreSync';
import { setBranches, setProvinces, setDepartments } from 'store/slices/dataSlice';

const FirestoreSyncManager = () => {
  // Memoize constraints if you use any (empty for now)
  const branchesConstraints = useMemo(() => [], []);
  const provincesConstraints = useMemo(() => [], []);
  const departmentsConstraints = useMemo(() => [], []);

  useFirestoreSync('data/company/branches', setBranches, branchesConstraints);
  useFirestoreSync('data/company/provinces', setProvinces, provincesConstraints);
  useFirestoreSync('data/company/departments', setDepartments, departmentsConstraints);

  return null; // This component does not render anything
};

export default FirestoreSyncManager;
