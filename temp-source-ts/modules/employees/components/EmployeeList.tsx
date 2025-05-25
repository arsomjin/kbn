import React, { useEffect, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Table, Button, Input, Select, Space, Card, Tag, Tooltip, Popconfirm, message, Empty, Row, Col } from 'antd';
import type { ColumnsType } from 'antd/es/table';
import { PlusOutlined, SearchOutlined, EditOutlined, DeleteOutlined, FileExcelOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { Employee, EmployeeStatus } from '../types';
import { employeeService } from '../services/employeeService';
import { useAuth } from 'contexts/AuthContext';
import { useProvince } from 'hooks/useProvince';
import ExcelImportExport from '../../../components/common/ExcelImportExport';
import LoadingScreen from '../../../components/common/LoadingScreen';
import { collection, getDocs, Timestamp } from 'firebase/firestore';
import { firestore as db } from '../../../services/firebase';
import dayjs from 'dayjs';
import PageTitle from 'components/common/PageTitle';
import DepartmentSelector from '../../../components/DepartmentSelector';
import { useDepartments } from 'hooks/useDepartments';
import PageDoc from '../../../components/PageDoc';
import MTable from 'components/Table';
import { useSelector } from 'react-redux';
import { useResponsive } from 'hooks/useResponsive';

const { Option } = Select;

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

export const EmployeeList: React.FC = () => {
  const { t } = useTranslation(['employees', 'common']);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { currentProvince, loading: provinceLoading } = useProvince();
  const departments = useSelector((state: any) => state.departments?.departments || {});
  const { isMobile, isTablet, isDesktop } = useResponsive();
  const [loading, setLoading] = useState(true);
  const [employees, setEmployees] = useState<EmployeeTableRow[]>([]);
  const [filters, setFilters] = useState({
    search: '',
    status: undefined as EmployeeStatus | undefined,
    department: undefined as string | undefined,
    position: undefined as string | undefined
  });

  useEffect(() => {
    if (!provinceLoading && currentProvince?.id) {
      loadEmployees();
    }
    // eslint-disable-next-line
  }, [provinceLoading, currentProvince?.id, filters]);

  const loadEmployees = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, 'data/company/employees'));
      const data: EmployeeTableRow[] = querySnapshot.docs.map(doc => {
        const docData = doc.data();
        let status = docData.status;
        if (statusMap[status]) {
          status = statusMap[status];
        }
        // Ensure all required Employee fields are present
        return {
          ...docData,
          status,
          id: doc.id,
          key: doc.id,
          employeeCode: docData.employeeCode || '',
          provinceId: docData.provinceId || '',
          branchId: docData.branchId || '',
          employeeId: docData.employeeId || '',
          firstName: docData.firstName || '',
          lastName: docData.lastName || '',
          position: docData.position || '',
          department: docData.department || '',
          email: docData.email || '',
          phone: docData.phone || '',
          address: docData.address || '',
          startDate: docData.startDate,
          endDate: docData.endDate,
          salary: docData.salary || 0,
          bankAccount: docData.bankAccount || '',
          bankName: docData.bankName || '',
          emergencyContact: docData.emergencyContact || { name: '', relationship: '', phone: '' },
          documents: docData.documents || [],
          createdAt: docData.createdAt,
          updatedAt: docData.updatedAt,
          createdBy: docData.createdBy || '',
          updatedBy: docData.updatedBy || '',
          deleted: docData.deleted || false
        };
      });
      setEmployees(data);
    } catch (error) {
      message.error(t('messages.error.loading'));
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await employeeService.deleteEmployee(id, user!.uid);
      message.success(t('messages.success.deleted'));
      loadEmployees();
    } catch (error) {
      message.error(t('messages.error.deleting'));
    }
  };

  const excelColumns = [
    {
      title: t('fields.employeeCode'),
      dataIndex: 'employeeCode',
      key: 'employeeCode'
    },
    {
      title: t('fields.firstName'),
      dataIndex: 'firstName',
      key: 'firstName'
    },
    {
      title: t('fields.lastName'),
      dataIndex: 'lastName',
      key: 'lastName'
    },
    {
      title: t('fields.position'),
      dataIndex: 'position',
      key: 'position'
    },
    {
      title: t('fields.department'),
      dataIndex: 'department',
      key: 'department'
    },
    {
      title: t('fields.status'),
      dataIndex: 'status',
      key: 'status'
    },
    {
      title: t('fields.startDate'),
      dataIndex: 'startDate',
      key: 'startDate'
    }
  ];

  // Generate unique, sorted position options from employees
  const positionOptions = Array.from(new Set(employees.map(e => e.position).filter(Boolean))).sort();

  // Responsive columns
  const columns: ColumnsType<EmployeeTableRow> = [
    {
      title: t('fields.name', { ns: 'employees' }),
      dataIndex: 'employeeCode',
      key: 'employeeCode',
      sorter: (a, b) => (a.employeeCode || '').localeCompare(b.employeeCode || '')
    },
    {
      title: t('fields.position'),
      dataIndex: 'position',
      key: 'position',
      sorter: (a, b) => (a.position || '').localeCompare(b.position || ''),
      ...(isMobile && { width: 100 })
    },
    {
      title: t('fields.department'),
      dataIndex: 'department',
      key: 'department',
      sorter: (a, b) => (a.department || '').localeCompare(b.department || ''),
      render: (departmentId: string) => {
        const dept = Object.values(departments).find((d: any) => d.id === departmentId);
        return dept && typeof dept === 'object' && 'department' in dept ? (dept as any).department : '-';
      },
      width: isMobile ? 100 : 120
    },
    // Only show status and startDate on tablet/desktop
    ...(isTablet || isDesktop
      ? [
          {
            title: t('fields.status'),
            dataIndex: 'status',
            key: 'status',
            render: (status: EmployeeStatus) => {
              if (!status) return <Tag color='default'>-</Tag>;
              const statusColors = {
                [EmployeeStatus.ACTIVE]: 'success',
                [EmployeeStatus.INACTIVE]: 'default',
                [EmployeeStatus.ON_LEAVE]: 'warning',
                [EmployeeStatus.TERMINATED]: 'error'
              };
              const color = statusColors[status] || 'default';
              const key = typeof status === 'string' ? status.toLowerCase() : '';
              return <Tag color={color}>{t(`status.${key}`) || status}</Tag>;
            },
            filters: Object.values(EmployeeStatus).map((status: EmployeeStatus) => ({
              text: t(`status.${status.toLowerCase()}`),
              value: status
            })),
            onFilter: (value: React.Key | boolean, record: EmployeeTableRow) => String(record.status) === String(value)
          },
          {
            title: t('fields.startDate'),
            dataIndex: 'startDate',
            key: 'startDate',
            render: (date: unknown) => {
              const d = toJSDate(date);
              return d && dayjs(d).isValid() ? dayjs(d).format('YYYY-MM-DD') : '-';
            },
            sorter: (a: EmployeeTableRow, b: EmployeeTableRow) => {
              const aDate = toJSDate(a.startDate);
              const bDate = toJSDate(b.startDate);
              return dayjs(aDate).unix() - dayjs(bDate).unix();
            }
          }
        ]
      : []),
    {
      title: t('actions', { ns: 'common' }) || t('actions'),
      key: 'actions',
      render: (_, record) => (
        <Space size='middle'>
          <Tooltip title={t('actions.edit') || t('edit', { ns: 'common' })}>
            <Button type='text' icon={<EditOutlined />} onClick={() => navigate(`/admin/employees/${record.id}`)} />
          </Tooltip>
          <Popconfirm
            title={t('messages.confirm.delete')}
            onConfirm={() => handleDelete(record.id)}
            okText={t('yes', { ns: 'common' })}
            cancelText={t('no', { ns: 'common' })}
          >
            <Tooltip title={t('actions.delete') || t('delete', { ns: 'common' })}>
              <Button type='text' danger icon={<DeleteOutlined />} />
            </Tooltip>
          </Popconfirm>
        </Space>
      ),
      width: isMobile ? 80 : undefined
    }
  ];

  if (loading || provinceLoading) {
    return <LoadingScreen />;
  }

  return (
    <div className='p-0 md:p-6'>
      <PageDoc />
      <Card className='mb-6'>
        <PageTitle title={t('title')} />
        <div
          className={`flex ${isMobile ? 'flex-col' : 'flex-row'} justify-between items-${isMobile ? 'stretch' : 'center'} gap-4`}
        >
          <div className={isMobile ? 'w-full' : ''}>
            <ExcelImportExport columns={excelColumns} data={employees} onImport={loadEmployees} templateDownload />
          </div>
          <Button
            type='primary'
            icon={<PlusOutlined />}
            onClick={() => navigate('/admin/employees/new')}
            className={isMobile ? 'w-full' : ''}
          >
            {t('actions.add')}
          </Button>
        </div>
      </Card>

      <Card>
        <div className={`mb-4 flex ${isMobile ? 'flex-col' : 'flex-row flex-wrap'} gap-4`}>
          <Row gutter={[16, 16]} className='mb-4'>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Input
                placeholder={t('search.placeholder')}
                prefix={<SearchOutlined />}
                value={filters.search}
                onChange={e => setFilters({ ...filters, search: e.target.value })}
                size='middle'
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder={t('filters.status')}
                allowClear
                value={filters.status}
                onChange={value => setFilters({ ...filters, status: value })}
                className='w-full'
              >
                {Object.values(EmployeeStatus).map(status => (
                  <Option key={status} value={status}>
                    {t(`status.${status.toLowerCase()}`)}
                  </Option>
                ))}
              </Select>
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <DepartmentSelector
                value={filters.department}
                onChange={(value: string) => setFilters({ ...filters, department: value })}
                placeholder={t('filters.department')}
                className='w-full'
                size='middle'
              />
            </Col>
            <Col xs={24} sm={12} md={8} lg={6}>
              <Select
                placeholder={t('filters.position')}
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
          </Row>
        </div>

        <MTable
          columns={columns}
          dataSource={employees}
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
              emptyText: <Empty description={t('messages.empty')} />
            }
            // size: isMobile ? 'small' : 'middle',
            // scroll: { x: isMobile ? 300 : 800 }
          }}
        />
      </Card>
    </div>
  );
};
