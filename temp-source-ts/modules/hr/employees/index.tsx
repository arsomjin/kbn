import React, { useEffect, useState } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { Button, Input, Modal, notification } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { EmployeeProfile } from './components/EmployeeProfile';
import { EmployeesTable } from './components/EmployeesTable';
import { RootState } from 'store';
import { setEmployees } from 'store/slices/employeesSlice';
import { useAuth } from 'contexts/AuthContext';
import { PERMISSIONS } from 'constants/Permissions';
import styles from './employees.module.css';

/**
 * Employees management main page (migrated, modernized, RBAC, i18next, AntD, Dayjs)
 */
const Employees: React.FC = () => {
  const { t } = useTranslation(['employees']);
  const dispatch = useDispatch();
  const [selected, setSelected] = useState<any>(null);
  const [show, setShow] = useState(false);
  const [isEdit, setIsEdit] = useState(false);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(false);
  const employees = useSelector((state: RootState) => state.employees.employees);
  const userProfile = useSelector((state: RootState) => state.auth.userProfile);
  const provinceId = userProfile?.provinceId;

  const { hasPermission } = useAuth();
  const canCreate = hasPermission(PERMISSIONS.EMPLOYEE_CREATE);
  const canEdit = hasPermission(PERMISSIONS.EMPLOYEE_EDIT);

  // Fetch employees on mount (stub: replace with actual fetch logic)
  useEffect(() => {
    // TODO: Replace with actual Firestore fetch using provinceId
    setLoading(false);
  }, [dispatch, provinceId]);

  // Search filter
  const filteredEmployees = Object.values(employees).filter(emp => {
    if (!search) return true;
    const s = search.toLowerCase();
    return (
      emp.firstName?.toLowerCase().includes(s) ||
      emp.lastName?.toLowerCase().includes(s) ||
      emp.employeeCode?.toLowerCase().includes(s)
    );
  });

  // Add new employee
  const handleAdd = () => {
    if (!canCreate) {
      notification.error({
        message: t('error.permissionDenied'),
        description: t('error.insufficientPermissions')
      });
      return;
    }
    setIsEdit(false);
    setSelected(null);
    setShow(true);
  };

  // Edit employee
  const handleEdit = (record: any) => {
    if (!canEdit) {
      notification.error({
        message: t('error.permissionDenied'),
        description: t('error.insufficientPermissions')
      });
      return;
    }
    if (!provinceId || !userProfile?.accessibleProvinceIds?.includes(provinceId)) {
      notification.error({
        message: t('error.permissionDenied'),
        description: t('error.insufficientPermissions')
      });
      return;
    }
    setIsEdit(true);
    setSelected(record);
    setShow(true);
  };

  return (
    <div className='min-h-screen p-4 bg-white dark:bg-gray-900'>
      <div className='flex flex-col md:flex-row md:items-center md:justify-between mb-4'>
        <h1 className='text-2xl font-bold mb-2 md:mb-0'>{t('employees:title')}</h1>
        <div className='flex gap-2 items-center'>
          <Input.Search
            placeholder={t('employees:searchPlaceholder')}
            value={search}
            onChange={e => setSearch(e.target.value)}
            allowClear
            className='w-64'
          />
          {canCreate && (
            <Button type='primary' icon={<PlusOutlined />} onClick={handleAdd}>
              {t('employees:addEmployee')}
            </Button>
          )}
        </div>
      </div>
      {/* EmployeesTable component migrated and integrated */}
      <EmployeesTable data={filteredEmployees} loading={loading} onEdit={handleEdit} provinceId={provinceId} />
      <Modal
        open={show}
        onCancel={() => setShow(false)}
        footer={null}
        width={600}
        destroyOnClose
        className={styles.modal}
      >
        <EmployeeProfile employee={selected} isEdit={isEdit} onClose={() => setShow(false)} provinceId={provinceId} />
      </Modal>
    </div>
  );
};

export default Employees;
