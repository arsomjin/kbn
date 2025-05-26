/**
 * HR menu children generator for MainLayout
 * Extracted for maintainability and testability.
 */
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../hooks/usePermissions';
import { PERMISSIONS } from '../../constants/Permissions';
import { getPathFromRole } from 'utils/roleUtils';
import { useAuth } from 'contexts/AuthContext';

/**
 * Generates the HR Management menu children.
 * @param hrBasePath The base path for hr routes
 */
export const useHrMenuChildren = (hrBasePath) => {
  const { t } = useTranslation('hr');
  const navigate = useNavigate();
  const { hasPermission } = usePermissions();
  const { userProfile } = useAuth();

  const menuItems = [];

  // Employee Management
  if (hasPermission(PERMISSIONS.EMPLOYEE_VIEW)) {
    menuItems.push({
      key: 'hr-employees',
      label: t('employees.title') || 'จัดการพนักงาน',
      onClick: () => navigate(getPathFromRole(userProfile, 'hr')),
    });
  }

  // Leave Management
  if (hasPermission(PERMISSIONS.LEAVE_VIEW)) {
    menuItems.push({
      key: 'hr-leave',
      label: t('leave.title') || 'จัดการการลา',
      children: [
        hasPermission(PERMISSIONS.LEAVE_CREATE) && {
          key: 'hr-leave-request',
          label: t('leave.request') || 'ขอลา',
          onClick: () => navigate(getPathFromRole(userProfile, 'hr/leave/request')),
        },
        {
          key: 'hr-leave-history',
          label: t('leave.history') || 'ประวัติการลา',
          onClick: () => navigate(getPathFromRole(userProfile, 'hr/leave/history')),
        },
        hasPermission(PERMISSIONS.LEAVE_APPROVE) && {
          key: 'hr-leave-approval',
          label: t('leave.approval') || 'อนุมัติการลา',
          onClick: () => navigate(getPathFromRole(userProfile, 'hr/leave/approval')),
        },
      ].filter(Boolean),
    });
  }

  // Attendance Management
  if (hasPermission(PERMISSIONS.ATTENDANCE_VIEW)) {
    menuItems.push({
      key: 'hr-attendance',
      label: t('attendance.title') || 'จัดการเวลาทำงาน',
      children: [
        hasPermission(PERMISSIONS.ATTENDANCE_CREATE) && {
          key: 'hr-attendance-checkin',
          label: t('attendance.checkin') || 'เช็คอิน/เช็คเอาท์',
          onClick: () => navigate(`${hrBasePath}/attendance/checkin`),
        },
        {
          key: 'hr-attendance-records',
          label: t('attendance.records') || 'บันทึกเวลาทำงาน',
          onClick: () => navigate(`${hrBasePath}/attendance/records`),
        },
        hasPermission(PERMISSIONS.ATTENDANCE_IMPORT) && {
          key: 'hr-attendance-import',
          label: t('attendance.import') || 'นำเข้าข้อมูลเวลาทำงาน',
          onClick: () => navigate(`${hrBasePath}/attendance/import`),
        },
      ].filter(Boolean),
    });
  }

  // HR Reports
  // if (hasPermission(PERMISSIONS.HR_REPORTS_VIEW)) {
  //   menuItems.push({
  //     key: 'hr-reports',
  //     label: t('reports.title') || 'รายงาน HR',
  //     children: [
  //       {
  //         key: 'hr-reports-attendance',
  //         label: t('reports.attendance') || 'รายงานเวลาทำงาน',
  //         onClick: () => navigate(`${hrBasePath}/reports/attendance`)
  //       },
  //       {
  //         key: 'hr-reports-leave',
  //         label: t('reports.leave') || 'รายงานการลา',
  //         onClick: () => navigate(`${hrBasePath}/reports/leave`)
  //       },
  //       {
  //         key: 'hr-reports-payroll',
  //         label: t('reports.payroll') || 'รายงานเงินเดือน',
  //         onClick: () => navigate(`${hrBasePath}/reports/payroll`)
  //       }
  //     ]
  //   });
  // }

  // HR Settings
  // if (hasPermission(PERMISSIONS.HR_SETTINGS_VIEW)) {
  //   menuItems.push({
  //     key: 'hr-settings',
  //     label: t('settings.title') || 'ตั้งค่า HR',
  //     children: [
  //       {
  //         key: 'hr-settings-departments',
  //         label: t('settings.departments') || 'แผนก',
  //         onClick: () => navigate(`${hrBasePath}/settings/departments`)
  //       },
  //       {
  //         key: 'hr-settings-positions',
  //         label: t('settings.positions') || 'ตำแหน่ง',
  //         onClick: () => navigate(`${hrBasePath}/settings/positions`)
  //       },
  //       {
  //         key: 'hr-settings-leave-types',
  //         label: t('settings.leaveTypes') || 'ประเภทการลา',
  //         onClick: () => navigate(`${hrBasePath}/settings/leave-types`)
  //       },
  //       hasPermission(PERMISSIONS.HR_SETTINGS_EDIT) && {
  //         key: 'hr-settings-policies',
  //         label: t('settings.policies') || 'นโยบาย HR',
  //         onClick: () => navigate(`${hrBasePath}/settings/policies`)
  //       }
  //     ].filter(Boolean)
  //   });
  // }

  return menuItems;
};
