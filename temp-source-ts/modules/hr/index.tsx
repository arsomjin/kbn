import React from 'react';
import { Routes, Route, useParams } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { Layout, Card, Alert } from 'antd';
import { useAuth } from 'contexts/AuthContext';
import { hasProvinceAccess } from '../../utils/permissions';
import { ROLES, RoleType, UserRole } from '../../constants/roles';
import { PERMISSIONS } from '../../constants/Permissions';
import PermissionProtectedRoute from '../../components/auth/PermissionProtectedRoute';
import NotFound from '../../components/common/NotFound';

// Import HR components
// import LeaveRequestForm from './components/LeaveRequestForm';
import LeaveHistory from './components/LeaveHistory';
// import AttendanceCheckIn from './components/AttendanceCheckIn';
// import AttendanceRecords from './components/AttendanceRecords';
import LeaveApproval from './components/LeaveApproval';
import Employees from './employees';
import Attendance from './components/Attendance';
import Leave from './components/Leave';

const { Content } = Layout;

// Lazy load remaining HR components that need to be implemented
const AttendanceImport = React.lazy(() => import('./components/AttendanceImport'));

/**
 * Main HR router component
 */
const HRModules: React.FC = () => {
  const { t } = useTranslation();
  const { provinceId } = useParams<{ provinceId: string }>();
  const { userProfile } = useAuth();

  const checkProvinceAccess = (): boolean => {
    if (!userProfile || !provinceId) return false;
    return hasProvinceAccess(userProfile, provinceId);
  };

  return (
    <Routes>
      {/* Employee Management */}
      <Route
        path='/employees'
        element={
          <PermissionProtectedRoute
            requiredPermission={PERMISSIONS.EMPLOYEE_VIEW}
            allowedRoles={[
              UserRole.SUPER_ADMIN,
              UserRole.DEVELOPER,
              UserRole.EXECUTIVE,
              UserRole.PROVINCE_MANAGER,
              UserRole.PROVINCE_ADMIN,
              UserRole.GENERAL_MANAGER,
              UserRole.BRANCH_MANAGER
            ]}
            provinceCheck={provinceId ? () => checkProvinceAccess() : undefined}
          >
            <Employees />
          </PermissionProtectedRoute>
        }
      />

      {/* Attendance Management */}
      <Route
        path='/attendance'
        element={
          <PermissionProtectedRoute
            requiredPermission={PERMISSIONS.ATTENDANCE_VIEW}
            allowedRoles={[
              UserRole.SUPER_ADMIN,
              UserRole.DEVELOPER,
              UserRole.EXECUTIVE,
              UserRole.PROVINCE_MANAGER,
              UserRole.PROVINCE_ADMIN,
              UserRole.GENERAL_MANAGER,
              UserRole.BRANCH_MANAGER,
              UserRole.USER
            ]}
            provinceCheck={provinceId ? () => checkProvinceAccess() : undefined}
          >
            <Attendance />
          </PermissionProtectedRoute>
        }
      />
      {/* Leave Management */}
      <Route
        path='/leave'
        element={
          <PermissionProtectedRoute
            requiredPermission={PERMISSIONS.LEAVE_VIEW}
            allowedRoles={[
              UserRole.SUPER_ADMIN,
              UserRole.DEVELOPER,
              UserRole.EXECUTIVE,
              UserRole.PROVINCE_MANAGER,
              UserRole.PROVINCE_ADMIN,
              UserRole.GENERAL_MANAGER,
              UserRole.BRANCH_MANAGER,
              UserRole.USER
            ]}
            provinceCheck={provinceId ? () => checkProvinceAccess() : undefined}
          >
            <Leave />
          </PermissionProtectedRoute>
        }
      />

      {/* Default redirect to employees */}
      <Route path='/' element={<Employees />} />
      <Route path='*' element={<NotFound />} />
    </Routes>
  );
};

export default HRModules;
