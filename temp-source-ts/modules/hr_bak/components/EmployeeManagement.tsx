import React, { useState, useEffect, useCallback } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams, useNavigate } from 'react-router-dom';
import type { ColumnsType } from 'antd/es/table';
import {
  Button,
  Card,
  Space,
  Input,
  Select,
  Modal,
  Form,
  Avatar,
  Tag,
  Tooltip,
  Row,
  Col,
  Divider,
  DatePicker,
  Empty,
  Popconfirm,
  Typography
} from 'antd';
import {
  PlusOutlined,
  SearchOutlined,
  EditOutlined,
  DeleteOutlined,
  UserOutlined,
  MoreOutlined,
  EyeOutlined,
  PhoneOutlined,
  MailOutlined,
  IdcardOutlined,
  UploadOutlined,
  BankOutlined,
  ContactsOutlined,
  FileExcelOutlined,
  ClearOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { useProvince } from '../../../hooks/useProvince';
import { useResponsive } from '../../../hooks/useResponsive';
import { useModal } from '../../../contexts/ModalContext';
import { hasPermission, hasProvinceAccess } from '../../../utils/permissions';
import { PERMISSIONS } from '../../../constants/Permissions';
import { Employee, EmployeeFormData, EmployeeFilters, EmployeeStatus } from 'types/hr';
import { hrEmployeeService } from '../services/hrEmployeeService';
import { useSelector } from 'react-redux';
import ExcelImportExport from '../../../components/common/ExcelImportExport';
import LoadingScreen from '../../../components/common/LoadingScreen';
import PageTitle from '../../../components/common/PageTitle';
import PageDoc from '../../../components/PageDoc';
import MTable from '../../../components/Table';
import DepartmentSelector from '../../../components/DepartmentSelector';
import dayjs from '../../../utils/dayjs';
import { getFirebaseErrorMessage } from '../../../utils/firebaseErrorMessages';
import { normalizeToDate } from 'utils/functions';
import { formatValuesBeforeLoad } from 'utils/dateHandling';

const { Search } = Input;
const { Option } = Select;
const { TextArea } = Input;
const { Text } = Typography;

const statusMap: Record<string, EmployeeStatus> = {
  ปกติ: EmployeeStatus.ACTIVE,
  ลาออก: EmployeeStatus.TERMINATED,
  พักงาน: EmployeeStatus.ON_LEAVE,
  ไม่ทำงาน: EmployeeStatus.INACTIVE,
  active: EmployeeStatus.ACTIVE,
  inactive: EmployeeStatus.INACTIVE,
  on_leave: EmployeeStatus.ON_LEAVE,
  terminated: EmployeeStatus.TERMINATED,
  resigned: EmployeeStatus.TERMINATED,
  probation: EmployeeStatus.ON_LEAVE, // Map as needed
  retired: EmployeeStatus.INACTIVE // Map as needed
};

function toJSDate(date: any): Date | null {
  if (!date) return null;
  if (typeof date === 'object' && typeof date.toDate === 'function') return date.toDate();
  if (date instanceof Date) return date;
  if (typeof date === 'number' || typeof date === 'string') {
    const d = new Date(date);
    return isNaN(d.getTime()) ? null : d;
  }
  return null;
}

// For table compatibility, extend Employee with key
export type EmployeeTableRow = Employee & { key: string };

/**
 * Employee Management Component - Integrated from legacy employee module
 */
export const EmployeeManagement: React.FC = () => {
  const { t } = useTranslation(['hr', 'employees', 'common']);
  const { provinceId, branchCode } = useParams<{ provinceId: string; branchCode?: string }>();
  const { userProfile, user } = useAuth();
  const { currentProvince, loading: provinceLoading } = useProvince();
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const { showConfirm, showSuccess, showWarning } = useModal();
  const departments = useSelector((state: any) => state.departments?.departments || {});
  const navigate = useNavigate();

  // State management
  const [employees, setEmployees] = useState<EmployeeTableRow[]>([]);
  const [loading, setLoading] = useState(false);
  const [filters, setFilters] = useState({
    search: '',
    status: undefined as EmployeeStatus | undefined,
    department: undefined as string | undefined,
    position: undefined as string | undefined
  });
  const [isModalVisible, setIsModalVisible] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<Employee | null>(null);
  const [isDetailModalVisible, setIsDetailModalVisible] = useState(false);
  const [selectedEmployee, setSelectedEmployee] = useState<Employee | null>(null);

  const [form] = Form.useForm<EmployeeFormData>();

  // Permission checks
  const canView = hasPermission(userProfile, PERMISSIONS.EMPLOYEE_VIEW);
  const canCreate = hasPermission(userProfile, PERMISSIONS.EMPLOYEE_CREATE);
  const canEdit = hasPermission(userProfile, PERMISSIONS.EMPLOYEE_EDIT);
  const canDelete = hasPermission(userProfile, PERMISSIONS.EMPLOYEE_DELETE);
  const hasProvinceAccessCheck = provinceId ? hasProvinceAccess(userProfile, provinceId) : true;

  useEffect(() => {
    // For root level access (/hr/employees), we don't need to wait for currentProvince
    // For province/branch level access, we wait for province data
    if (!provinceId || (!provinceLoading && currentProvince?.id)) {
      loadEmployees();
    }
    // eslint-disable-next-line
  }, [provinceLoading, currentProvince?.id, canView, hasProvinceAccessCheck, provinceId, branchCode]);

  const loadEmployees = async () => {
    setLoading(true);
    try {
      // Determine access level and apply appropriate filtering
      let accessLevel: 'root' | 'province' | 'branch';
      let targetProvinceId: string | undefined;
      let targetBranchCode: string | undefined;

      // Level 1: Root level (/hr/employees) - No province/branch filtering
      if (!provinceId && !branchCode) {
        accessLevel = 'root';
      }
      // Level 3: Branch level (/hr/{provinceId}/{branchCode}/employees) - Both province and branch filtering
      else if (provinceId && branchCode) {
        accessLevel = 'branch';
        targetProvinceId = provinceId;
        targetBranchCode = branchCode;
      }
      // Level 2: Province level (/hr/{provinceId}/employees) - Only province filtering
      else if (provinceId && !branchCode) {
        accessLevel = 'province';
        targetProvinceId = provinceId;
      } else {
        throw new Error('Invalid access level configuration');
      }

      // Load all employees for the access level (no client-side filters applied here)
      const employeeList = await hrEmployeeService.getEmployeesByAccessLevel(
        accessLevel,
        targetProvinceId,
        targetBranchCode
      );

      // Convert to table row format with keys
      const employeeTableRows: EmployeeTableRow[] = employeeList.map(emp => ({
        ...emp,
        key: emp.id || emp.employeeId || emp.employeeCode || `emp_${Date.now()}_${Math.random()}`
      }));

      setEmployees(employeeTableRows);
    } catch (error) {
      console.error('Error loading employees:', error);
      const errorMessage = getFirebaseErrorMessage(error, t);
      showWarning(errorMessage || t('employees.error.loadFailed', { ns: 'hr' }), 5);
      setEmployees([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateEmployee = () => {
    setEditingEmployee(null);
    form.resetFields();
    setIsModalVisible(true);
  };

  const handleEditEmployee = (employee: Employee) => {
    // Convert all date fields to dayjs for Ant Design DatePicker compatibility
    // const formValues = {
    //   ...employee,
    //   hireDate: employee.hireDate ? dayjs(normalizeToDate(employee.hireDate)) : undefined,
    //   startDate: employee.startDate ? dayjs(normalizeToDate(employee.startDate)) : undefined,
    //   endDate: employee.endDate ? dayjs(normalizeToDate(employee.endDate)) : undefined
    // };
    setEditingEmployee(employee);
    form.setFieldsValue(employee);
    setIsModalVisible(true);
  };

  const handleDeleteEmployee = (employee: Employee) => {
    showConfirm({
      title: t('employees.deleteConfirm.title', { ns: 'hr' }),
      content: t('employees.deleteConfirm.content', { name: `${employee.firstName} ${employee.lastName}`, ns: 'hr' }),
      onOk: async () => {
        try {
          if (!employee.id) {
            showWarning(t('employees.error.invalidId', { ns: 'hr' }));
            return;
          }

          // Use the employee's existing province ID for deletion (from unified collection)
          const employeeProvinceId = employee.provinceId || provinceId || currentProvince?.id || '';
          if (!employeeProvinceId) {
            showWarning('No valid province ID available for this employee');
            return;
          }

          await hrEmployeeService.deleteEmployee(employeeProvinceId, employee.id, user!.uid);

          showSuccess(t('employees.deleteSuccess', { ns: 'hr' }));
          loadEmployees();
        } catch (error) {
          console.error('Error deleting employee:', error);
          const errorMessage = getFirebaseErrorMessage(error, t);
          showWarning(errorMessage || t('employees.error.deleteFailed', { ns: 'hr' }));
        }
      }
    });
  };

  const handleDelete = async (id: string | undefined) => {
    if (!id) {
      showWarning(t('employees.error.invalidId', { ns: 'hr' }));
      return;
    }

    try {
      // Find the employee to get their province ID from the unified collection
      const employee = employees.find(emp => emp.id === id);
      if (!employee) {
        showWarning('Employee not found');
        return;
      }

      const employeeProvinceId = employee.provinceId || provinceId || currentProvince?.id || '';
      if (!employeeProvinceId) {
        showWarning('No valid province ID available for this employee');
        return;
      }

      await hrEmployeeService.deleteEmployee(employeeProvinceId, id, user!.uid);
      showSuccess(t('messages.success.deleted', { ns: 'employees' }));
      loadEmployees();
    } catch (error) {
      console.error('Error deleting employee:', error);
      const errorMessage = getFirebaseErrorMessage(error, t);
      showWarning(errorMessage || t('messages.error.deleting', { ns: 'employees' }));
    }
  };

  // Excel export columns
  const excelColumns = [
    {
      title: t('fields.employeeCode', { ns: 'employees' }),
      dataIndex: 'employeeCode',
      key: 'employeeCode'
    },
    {
      title: t('fields.firstName', { ns: 'employees' }),
      dataIndex: 'firstName',
      key: 'firstName'
    },
    {
      title: t('fields.lastName', { ns: 'employees' }),
      dataIndex: 'lastName',
      key: 'lastName'
    },
    {
      title: t('fields.position', { ns: 'employees' }),
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: t('fields.department', { ns: 'employees' }),
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: t('fields.status', { ns: 'employees' }),
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: t('fields.startDate', { ns: 'employees' }),
      dataIndex: 'startDate',
      key: 'startDate'
    }
  ];

  // Generate unique, sorted position options from employees
  const positionOptions = Array.from(new Set(employees.map(e => e.position).filter(Boolean))).sort();

  const handleSubmit = async (values: EmployeeFormData) => {
    try {
      setLoading(true);

      // Determine the target province ID for this employee in the unified collection
      let targetProvinceId = provinceId || currentProvince?.id || '';

      // For root level access, we need to determine which province to assign
      if (!provinceId && !branchCode) {
        // If creating from root level, we need a province ID - could come from form or default
        if (!targetProvinceId) {
          showWarning('Province ID is required for employee creation');
          return;
        }
      }

      if (!targetProvinceId) {
        showWarning('No valid province ID available');
        return;
      }

      const employeeData = {
        ...values,
        hireDate: values.hireDate ? values.hireDate : undefined,
        provinceId: targetProvinceId, // Ensure provinceId is set for unified collection
        branchCode: branchCode || '', // Ensure branchCode is set for proper hierarchy
        startDate: values.startDate || new Date()
      };

      if (editingEmployee && editingEmployee.id) {
        // Update existing employee - use the employee's existing province ID in unified collection
        const updateProvinceId = editingEmployee.provinceId || targetProvinceId;
        await hrEmployeeService.updateEmployee(updateProvinceId, editingEmployee.id, employeeData, user!.uid);
        showSuccess(t('employees.updateSuccess'));
      } else {
        // Create new employee in unified collection
        await hrEmployeeService.createEmployee(targetProvinceId, employeeData, user!.uid);
        showSuccess(t('employees.createSuccess'));
      }

      setIsModalVisible(false);
      form.resetFields();
      loadEmployees();
    } catch (error) {
      console.error('Error saving employee:', error);
      const errorMessage = getFirebaseErrorMessage(error, t);
      showWarning(
        errorMessage || (editingEmployee ? t('employees.error.updateFailed') : t('employees.error.createFailed'))
      );
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: EmployeeStatus) => {
    switch (status) {
      case EmployeeStatus.ACTIVE:
        return 'green';
      case EmployeeStatus.INACTIVE:
        return 'orange';
      case EmployeeStatus.TERMINATED:
        return 'red';
      case EmployeeStatus.ON_LEAVE:
        return 'blue';
      case EmployeeStatus.PROBATION:
        return 'yellow';
      case EmployeeStatus.RESIGNED:
        return 'red';
      default:
        return 'default';
    }
  };

  // Apply filters to employees - Pure client-side filtering (no API calls on search)
  // This filters from the already loaded employees data for better performance
  const filteredEmployees = employees.filter(employee => {
    const matchesSearch =
      !filters.search ||
      employee.firstName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.lastName?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.employeeCode?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.employeeId?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.email?.toLowerCase().includes(filters.search.toLowerCase()) ||
      employee.phone?.toLowerCase().includes(filters.search.toLowerCase()) ||
      `${employee.firstName} ${employee.lastName}`.toLowerCase().includes(filters.search.toLowerCase());

    const matchesStatus = !filters.status || employee.status === filters.status;
    const matchesDepartment = !filters.department || employee.department === filters.department;
    const matchesPosition = !filters.position || employee.position === filters.position;

    return matchesSearch && matchesStatus && matchesDepartment && matchesPosition;
  });

  // Responsive columns based on EmployeeList design
  const columns: ColumnsType<EmployeeTableRow> = [
    {
      title: t('fields.name', { ns: 'employees' }),
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      sorter: (a, b) => (a.employeeCode || '').localeCompare(b.employeeCode || ''),
      render: (_, employee: EmployeeTableRow) => (
        <Space>
          <Avatar
            src={employee.avatar || employee.photoUrl}
            icon={<UserOutlined />}
            size={isMobile ? 'default' : 'large'}
          />
          <div>
            <div style={{ fontWeight: 500 }}>
              {employee.firstName} {employee.lastName}
            </div>
            <div style={{ color: '#666', fontSize: '12px' }}>{employee.employeeCode}</div>
          </div>
        </Space>
      )
    },
    {
      title: t('fields.position', { ns: 'employees' }),
      dataIndex: 'position',
      key: 'position',
      sorter: (a, b) => (a.position || '').localeCompare(b.position || ''),
      ...(isMobile && { width: 100 })
    },
    {
      title: t('fields.department', { ns: 'employees' }),
      dataIndex: 'department',
      key: 'department',
      sorter: (a, b) => (a.department || '').localeCompare(b.department || ''),
      render: (departmentId: string): React.ReactNode => {
        const dept = Object.values(departments).find((d: any) => d.id === departmentId);
        return dept && typeof dept === 'object' && 'department' in dept ? String(dept.department) : departmentId || '-';
      },
      width: isMobile ? 100 : 120
    },
    // Only show status and startDate on tablet/desktop
    ...(isTablet || isDesktop
      ? [
          {
            title: t('fields.status', { ns: 'employees' }),
            dataIndex: 'status',
            key: 'status',
            render: (status: EmployeeStatus) => {
              if (!status) return <Tag color='default'>-</Tag>;
              const statusColors: Record<EmployeeStatus, string> = {
                [EmployeeStatus.ACTIVE]: 'success',
                [EmployeeStatus.INACTIVE]: 'default',
                [EmployeeStatus.ON_LEAVE]: 'warning',
                [EmployeeStatus.TERMINATED]: 'error',
                [EmployeeStatus.PROBATION]: 'processing',
                [EmployeeStatus.RESIGNED]: 'error'
              };
              const color = statusColors[status] || 'default';
              const key = typeof status === 'string' ? status.toLowerCase() : '';
              return <Tag color={color}>{t(`status.${key}`, { ns: 'employees' }) || status}</Tag>;
            },
            filters: Object.values(EmployeeStatus).map((status: EmployeeStatus) => ({
              text: t(`status.${status.toLowerCase()}`, { ns: 'employees' }),
              value: status
            })),
            onFilter: (value: React.Key | boolean, record: EmployeeTableRow) => String(record.status) === String(value)
          },
          {
            title: t('fields.startDate', { ns: 'employees' }),
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date: unknown) => {
              const d = normalizeToDate(date);
              return d && dayjs(d).isValid() ? dayjs(d).format('YYYY-MM-DD') : '-';
            },
            sorter: (a: EmployeeTableRow, b: EmployeeTableRow) => {
              const aDate = dayjs(normalizeToDate(a.startDate));
              const bDate = dayjs(normalizeToDate(b.startDate));
              if (!aDate.isValid() && !bDate.isValid()) return 0;
              if (!aDate.isValid()) return -1;
              if (!bDate.isValid()) return 1;
              return aDate.unix() - bDate.unix();
            }
          }
        ]
      : []),
    {
      title: t('actions', { ns: 'common' }) || t('actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size='middle'>
          <Tooltip title={t('actions.edit', { ns: 'employees' }) || t('edit', { ns: 'common' })}>
            <Button type='text' icon={<EditOutlined />} onClick={() => handleEditEmployee(record)} />
          </Tooltip>
          <Popconfirm
            title={t('messages.confirm.delete', { ns: 'employees' })}
            onConfirm={() => handleDelete(record.id)}
            okText={t('yes', { ns: 'common' })}
            cancelText={t('no', { ns: 'common' })}
          >
            <Tooltip title={t('actions.delete', { ns: 'employees' }) || t('delete', { ns: 'common' })}>
              <Button type='text' danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
      width: isMobile ? 80 : undefined
    }
  ];

  // Determine access level for display
  const getAccessLevelInfo = () => {
    if (!provinceId && !branchCode) {
      return {
        level: 'Root',
        description: 'All Employees (All Provinces)',
        color: 'purple'
      };
    } else if (provinceId && branchCode) {
      return {
        level: 'Branch',
        description: `Province: ${provinceId} | Branch: ${branchCode}`,
        color: 'blue'
      };
    } else if (provinceId && !branchCode) {
      return {
        level: 'Province',
        description: `Province: ${provinceId}`,
        color: 'green'
      };
    }
    return {
      level: 'Unknown',
      description: 'Unknown Access Level',
      color: 'default'
    };
  };

  const accessInfo = getAccessLevelInfo();

  if (!canView || !hasProvinceAccessCheck) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <h3>{t('common.accessDenied')}</h3>
          <p>{t('common.insufficientPermissions')}</p>
        </div>
      </Card>
    );
  }

  if (loading || provinceLoading) {
    return <LoadingScreen />;
  }

  // Add reset filter functionality
  const resetFilters = () => {
    setFilters({
      search: '',
      status: undefined,
      department: undefined,
      position: undefined
    });
  };

  return (
    <div className='p-0 md:p-6'>
      <Card className='mb-6'>
        <PageTitle title={t('employees.title', { ns: 'hr' }) || t('title', { ns: 'employees' })} />
        <div
          className={`flex ${isMobile ? 'flex-col' : 'flex-row'} justify-between items-${isMobile ? 'stretch' : 'center'} gap-4`}
        >
          <div className={isMobile ? 'w-full' : ''}>
            <ExcelImportExport columns={excelColumns} data={employees} onImport={loadEmployees} templateDownload />
          </div>
          {canCreate && (
            <Button
              type='primary'
              icon={<PlusOutlined />}
              onClick={handleCreateEmployee}
              className={isMobile ? 'w-full' : ''}
            >
              {t('actions.add', { ns: 'employees' }) || t('employees.addEmployee', { ns: 'hr' })}
            </Button>
          )}
        </div>
      </Card>

      <Card>
        <div className={`mb-4 flex ${isMobile ? 'flex-col' : 'flex-row flex-wrap'} gap-4`}>
          <Row gutter={[16, 16]} className='mb-4'>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder={t('search.placeholder', { ns: 'employees' })}
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                size='middle'
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder={t('filters.status', { ns: 'employees' })}
                allowClear
                value={filters.status}
                onChange={value => setFilters({ ...filters, status: value })}
                className='w-full'
              >
                {Object.values(EmployeeStatus).map(status => (
                  <Option key={status} value={status}>
                    {t(`status.${status.toLowerCase()}`, { ns: 'employees' }) ||
                      t(`status.${status.toLowerCase()}`, { ns: 'employees' })}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <DepartmentSelector
                value={filters.department}
                onChange={(value: string) => setFilters({ ...filters, department: value })}
                placeholder={t('filters.department', { ns: 'employees' })}
                className='w-full'
                size='middle'
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder={t('filters.position', { ns: 'employees' })}
                allowClear
                value={filters.position}
                onChange={value => setFilters({ ...filters, position: value })}
                className='w-full'
              >
                {positionOptions.map(position => (
                  <Option key={position} value={position}>
                    {position}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={24} md={24} lg={24}>
              <Space className='w-full justify-end'>
                <Button icon={<ClearOutlined />} onClick={resetFilters} type='default'>
                  {t('actions.resetFilters', { ns: 'employees' })}
                </Button>
                <Text type='secondary' className='ml-2'>
                  {t('results.showing', {
                    count: filteredEmployees.length,
                    total: employees.length,
                    ns: 'employees'
                  })}
                </Text>
              </Space>
            </Col>
          </Row>
        </div>

        <MTable
          columns={columns}
          dataSource={filteredEmployees}
          rowKey='key'
          loading={loading || provinceLoading}
          tableProps={{
            pagination: {
              showSizeChanger: !isMobile,
              showTotal: total => t('total', { total, ns: 'common' }),
              size: isMobile ? 'small' : 'default',
              responsive: true
            },
            className: 'overflow-x-auto',
            locale: {
              emptyText: <Empty description={t('messages.empty', { ns: 'employees' })} />
            }
          }}
        />
      </Card>

      <Modal
        title={editingEmployee ? t('actions.edit', { ns: 'employees' }) : t('actions.add', { ns: 'employees' })}
        open={isModalVisible}
        onCancel={() => setIsModalVisible(false)}
        footer={null}
        width={600}
      >
        <Form form={form} layout='vertical' onFinish={handleSubmit}>
          <Row gutter={16}>
            <Col span={12}>
              <Form.Item name='employeeId' label={t('fields.employeeId', { ns: 'employees' })}>
                <Input prefix={<IdcardOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='status'
                label={t('fields.status', { ns: 'employees' })}
                rules={[{ required: true, message: t('validation.required.status', { ns: 'employees' }) }]}
              >
                <Select>
                  <Option value={EmployeeStatus.ACTIVE}>{t('status.active', { ns: 'employees' })}</Option>
                  <Option value={EmployeeStatus.INACTIVE}>{t('status.inactive', { ns: 'employees' })}</Option>
                  <Option value={EmployeeStatus.TERMINATED}>{t('status.terminated', { ns: 'employees' })}</Option>
                  <Option value={EmployeeStatus.ON_LEAVE}>{t('status.on_leave', { ns: 'employees' })}</Option>
                  <Option value={EmployeeStatus.PROBATION}>{t('status.probation', { ns: 'employees' })}</Option>
                  <Option value={EmployeeStatus.RESIGNED}>{t('status.resigned', { ns: 'employees' })}</Option>
                </Select>
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='firstName'
                label={t('fields.firstName', { ns: 'employees' })}
                rules={[{ required: true, message: t('validation.required.firstName', { ns: 'employees' }) }]}
              >
                <Input />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='lastName'
                label={t('fields.lastName', { ns: 'employees' })}
                rules={[{ required: true, message: t('validation.required.lastName', { ns: 'employees' }) }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='email'
                label={t('fields.email', { ns: 'employees' })}
                rules={[
                  { required: true, message: t('validation.required.email', { ns: 'employees' }) },
                  { type: 'email', message: t('validation.format.email', { ns: 'employees' }) }
                ]}
              >
                <Input prefix={<MailOutlined />} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='phone'
                label={t('fields.phone', { ns: 'employees' })}
                rules={[{ required: true, message: t('validation.required.phone', { ns: 'employees' }) }]}
              >
                <Input prefix={<PhoneOutlined />} />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='department'
                label={t('fields.department', { ns: 'employees' })}
                rules={[{ required: true, message: t('validation.required.department', { ns: 'employees' }) }]}
              >
                <Select>
                  <Option value='IT'>IT</Option>
                  <Option value='HR'>HR</Option>
                  <Option value='Finance'>Finance</Option>
                  <Option value='Sales'>Sales</Option>
                </Select>
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='position'
                label={t('fields.position', { ns: 'employees' })}
                rules={[{ required: true, message: t('validation.required.position', { ns: 'employees' }) }]}
              >
                <Input />
              </Form.Item>
            </Col>
          </Row>

          <Row gutter={16}>
            <Col span={12}>
              <Form.Item
                name='startDate'
                label={t('fields.startDate', { ns: 'employees' })}
                rules={[{ required: true, message: t('validation.required.startDate', { ns: 'employees' }) }]}
              >
                <DatePicker style={{ width: '100%' }} />
              </Form.Item>
            </Col>
            <Col span={12}>
              <Form.Item
                name='salary'
                label={t('fields.salary', { ns: 'employees' })}
                // rules={[{ required: true, message: t('fields.salaryRequired', { ns: 'employees' }) }]}
              >
                <Input type='number' min={0} />
              </Form.Item>
            </Col>
          </Row>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setIsModalVisible(false)}>{t('common.cancel')}</Button>
              <Button type='primary' htmlType='submit' loading={loading}>
                {editingEmployee ? t('common.update') : t('create', { ns: 'common' })}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
      <PageDoc />
    </div>
  );
};

export default EmployeeManagement;
