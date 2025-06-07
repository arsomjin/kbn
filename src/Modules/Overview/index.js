import { Skeleton } from 'antd';
import { checkCollection } from 'firebase/api';
import { showAlert, showWarn } from 'functions';
import React, { useCallback, useContext, useEffect, useRef, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { logoutUser } from 'redux/actions/auth';
import Dashboard from './components/Dashboard';
import LandingPage from './components/LandingPage';
import { checkDoc } from 'firebase/api';
import { FirebaseContext } from '../../firebase';

// ✅ Add RBAC imports
import { PermissionGate } from 'components';
import { usePermissions } from 'hooks/usePermissions';

// Lazy load the enhanced role-based dashboard with hierarchical switching
const EnhancedRoleBasedDashboard = React.lazy(() => import('./components/EnhancedRoleBasedDashboard'));

const OverviewModule = () => {
  const { api } = useContext(FirebaseContext);
  const { user } = useSelector(state => state.auth);
  const { branches, departments } = useSelector(state => state.data);
  const [userData, setUser] = useState({});
  const [ready, setReady] = useState(false);
  const alertRef = useRef();

  // ✅ Add RBAC hooks
  const { 
    hasPermission, 
    hasDepartmentAccess, 
    isSuperAdmin,
  } = usePermissions();

  const dispatch = useDispatch();

  const _checkStatus = useCallback(
    async usr => {
      try {
        if (!usr?.firstName) {
          return;
        }
        // Get status.
        let wheres = [['firstName', '==', usr.firstName]];
        if (!!usr?.lastName) {
          wheres = wheres.concat([['lastName', '==', usr.lastName]]);
        }
        const snap = await checkCollection('data/company/employees', wheres);
        let userData = [];
        if (snap) {
          snap.forEach(doc => {
            userData.push({
              ...doc.data(),
              _key: doc.id,
              id: userData.length,
              key: userData.length
            });
          });
        }
        if (userData.length > 0) {
          let status = userData[0]?.status || 'ปกติ';
          if (status === 'ลาออก') {
            // Update state.
            const stateDoc = await checkDoc('status', user.uid);
            if (stateDoc) {
              await api.updateItem(
                {
                  ...stateDoc.data(),
                  state: 'offline',
                  last_offline: Date.now()
                },
                'status',
                user.uid
              );
            }
            // Sign user out.
            dispatch(logoutUser());
            !alertRef.current &&
              showAlert(
                'ไม่สามารถเข้าระบบได้',
                `สถานภาพปัจจุบันของคุณ${usr.firstName} ${
                  usr.lastName || ''
                } คือ "ลาออก" หากข้อมูลไม่ถูกต้อง กรุณาติดต่อฝ่ายบุคคล`,
                'warning'
              );
            alertRef.current = true;
          }
        }
      } catch (e) {
        showWarn(e);
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    []
  );

  useEffect(() => {
    const uData = {
      coverImg: require('../../images/user-profile/up-user-details-background.jpg'),
      avatarImg: user?.photoURL || require('../../images/avatars/blank-profile.png'),
      name: user?.displayName || `${user.firstName} ${user.lastName}`,
      bio: 'คูโบต้าเบญจพล',
      email: user.email,
      location: user?.branch ? branches[user.branch]?.branchName || '-' : '-',
      phone: user.phoneNumber || '-',
      department: user?.department ? departments[user.department]?.department || '-' : '-',
      social: {
        facebook: '#',
        twitter: '#',
        github: '#',
        slack: '#'
      },
      tags: ['User Experience', 'UI Design', 'React JS', 'HTML & CSS', 'JavaScript', 'Bootstrap 4']
    };
    _checkStatus(user);
    setUser(uData);
    setReady(true);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (!ready) {
    return <Skeleton active />;
  }

  // ✅ Enhanced permission logic with RBAC
  const canAccessDashboard = user?.isDev || 
                            isSuperAdmin || 
                            hasPermission('reports.view') ||
                            hasDepartmentAccess('reports') ||
                            (user?.permCats && user.permCats?.permCat001);

  // Use enhanced role-based dashboard with hierarchical switching
  if (canAccessDashboard) {
    return (
      <React.Suspense fallback={<div>Loading dashboard...</div>}>
        <EnhancedRoleBasedDashboard />
      </React.Suspense>
    );
  }

  // For users who don't meet dashboard criteria, use PermissionGate as fallback
  return (
    <PermissionGate
      anyOf={['reports.view', 'accounting.view', 'sales.view', 'service.view']}
      fallback={<LandingPage userData={userData} />}
    >
      <React.Suspense fallback={<div>Loading dashboard...</div>}>
        <EnhancedRoleBasedDashboard />
      </React.Suspense>
    </PermissionGate>
  );
};

export default OverviewModule;
