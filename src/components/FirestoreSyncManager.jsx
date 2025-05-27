import React, { useMemo } from 'react';
import useFirestoreSync from 'hooks/useFirestoreSync';
import {
  setBranches,
  setProvinces,
  setDepartments,
  setBanks,
  setBankNames,
  setDataSources,
  setDealers,
  setExecutives,
  setEmployees,
  setExpenseAccountNames,
  setExpenseCategories,
  setLocations,
  setPlants,
  setUsers,
  setWarehouses,
} from 'store/slices/dataSlice';
import { useAuth } from '../contexts/AuthContext';
import RenderMonitor from './debug/RenderMonitor';

const FirestoreSyncManager = () => {
  const { user } = useAuth();

  // Memoize isAuth to prevent unnecessary re-renders
  const isAuth = useMemo(() => Boolean(user?.uid), [user?.uid]);

  // Memoize empty constraints arrays to prevent re-creation on every render
  const emptyConstraints = useMemo(() => [], []);

  console.log('[FirestoreSyncManager] Render - user:', !!user, 'isAuth:', isAuth);

  // --- No Authentication Required Listeners ---
  useFirestoreSync('data/company/branches', setBranches, emptyConstraints);
  useFirestoreSync('data/company/provinces', setProvinces, emptyConstraints);
  useFirestoreSync('data/company/departments', setDepartments, emptyConstraints);

  // --- Authentication Required Listeners ---
  useFirestoreSync('data/company/banks', setBanks, emptyConstraints, isAuth);
  useFirestoreSync('data/company/bankNames', setBankNames, emptyConstraints, isAuth);
  useFirestoreSync('data/sales/dataSources', setDataSources, emptyConstraints, isAuth);
  useFirestoreSync('data/sales/dealers', setDealers, emptyConstraints, isAuth);
  useFirestoreSync('data/company/executives', setExecutives, emptyConstraints, isAuth);
  useFirestoreSync('data/company/employees', setEmployees, emptyConstraints, isAuth);
  useFirestoreSync(
    'data/account/expenseAccountNames',
    setExpenseAccountNames,
    emptyConstraints,
    isAuth,
  );
  useFirestoreSync(
    'data/account/expenseCategories',
    setExpenseCategories,
    emptyConstraints,
    isAuth,
  );
  useFirestoreSync('data/company/locations', setLocations, emptyConstraints, isAuth);
  useFirestoreSync('data/sales/plants', setPlants, emptyConstraints, isAuth);
  useFirestoreSync('users', setUsers, emptyConstraints, isAuth);
  useFirestoreSync('data/company/warehouses', setWarehouses, emptyConstraints, isAuth);
  // useFirestoreSync('modelList', setModelLists, emptyConstraints, isAuth);
  // useFirestoreSync('data/company/permissions', setPermissions, emptyConstraints, isAuth);
  // useFirestoreSync('data/company/permissionCategories', setPermissionCategories, emptyConstraints, isAuth);
  // useFirestoreSync('data/sales/referrers', setReferrers, emptyConstraints, isAuth);
  // useFirestoreSync('data/company/userGroups', setUserGroups, emptyConstraints, isAuth);
  // useFirestoreSync('data/products/vehicleList', setVehicleLists, emptyConstraints, isAuth);

  return <RenderMonitor componentName="FirestoreSyncManager" />;
};

export default FirestoreSyncManager;
