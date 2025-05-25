import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  Table,
  Card,
  DatePicker,
  Select,
  Input,
  Space,
  Tag,
  Row,
  Col,
  Statistic,
  Button,
  Tooltip,
  Typography
} from 'antd';
import {
  CalendarOutlined,
  ClockCircleOutlined,
  SearchOutlined,
  DownloadOutlined,
  FilterOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission, hasProvinceAccess } from '../../../utils/permissions';
import { PERMISSIONS } from '../../../constants/Permissions';
import dayjs from '../../../utils/dayjs';
import duration from 'dayjs/plugin/duration';

dayjs.extend(duration);

const { RangePicker } = DatePicker;
const { Option } = Select;
const { Search } = Input;
const { Text } = Typography;

interface AttendanceRecord {
  id: string;
  employeeId: string;
  employeeName: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours: number;
  overtime: number;
  location: string;
  status: 'present' | 'absent' | 'late' | 'partial';
  notes?: string;
  provinceId: string;
  branchCode?: string;
  createdAt: string;
  updatedAt: string;
}

/**
 * Attendance Records Component
 */
export const AttendanceRecords: React.FC = () => {
  const { t } = useTranslation('hr');
  const { provinceId, branchCode } = useParams<{ provinceId: string; branchCode?: string }>();
  const { userProfile } = useAuth();

  const [records, setRecords] = useState<AttendanceRecord[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchText, setSearchText] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [dateRange, setDateRange] = useState<[dayjs.Dayjs | null, dayjs.Dayjs | null] | null>([
    dayjs().startOf('month'),
    dayjs().endOf('month')
  ]);

  // Check permissions
  const canView = hasPermission(userProfile, PERMISSIONS.ATTENDANCE_VIEW);
  const canEdit = hasPermission(userProfile, PERMISSIONS.ATTENDANCE_EDIT);
  const hasProvinceAccessCheck = provinceId ? hasProvinceAccess(userProfile, provinceId) : true;

  // Mock data for development
  const mockRecords: AttendanceRecord[] = [
    {
      id: '1',
      employeeId: 'emp1',
      employeeName: 'John Doe',
      date: '2024-12-20',
      checkIn: '09:00:00',
      checkOut: '18:00:00',
      breakStart: '12:00:00',
      breakEnd: '13:00:00',
      totalHours: 8,
      overtime: 0,
      location: 'Bangkok Office',
      status: 'present',
      provinceId: provinceId || 'bangkok',
      branchCode: branchCode,
      createdAt: '2024-12-20T09:00:00Z',
      updatedAt: '2024-12-20T18:00:00Z'
    },
    {
      id: '2',
      employeeId: 'emp1',
      employeeName: 'John Doe',
      date: '2024-12-19',
      checkIn: '09:15:00',
      checkOut: '18:30:00',
      breakStart: '12:00:00',
      breakEnd: '13:00:00',
      totalHours: 8.25,
      overtime: 0.25,
      location: 'Bangkok Office',
      status: 'late',
      notes: 'Traffic jam',
      provinceId: provinceId || 'bangkok',
      branchCode: branchCode,
      createdAt: '2024-12-19T09:15:00Z',
      updatedAt: '2024-12-19T18:30:00Z'
    },
    {
      id: '3',
      employeeId: 'emp2',
      employeeName: 'Jane Smith',
      date: '2024-12-20',
      checkIn: '08:45:00',
      checkOut: '17:45:00',
      breakStart: '12:00:00',
      breakEnd: '13:00:00',
      totalHours: 8,
      overtime: 0,
      location: 'Bangkok Office',
      status: 'present',
      provinceId: provinceId || 'bangkok',
      branchCode: branchCode,
      createdAt: '2024-12-20T08:45:00Z',
      updatedAt: '2024-12-20T17:45:00Z'
    }
  ];

  useEffect(() => {
    if (canView && hasProvinceAccessCheck) {
      loadAttendanceRecords();
    }
  }, [canView, hasProvinceAccessCheck, provinceId, branchCode, dateRange]);

  const loadAttendanceRecords = async () => {
    setLoading(true);
    try {
      // TODO: Replace with actual Firebase query
      // const attendanceRef = collection(db, 'data', provinceId!, 'attendance');
      // let q = query(
      //   attendanceRef,
      //   where('provinceId', '==', provinceId),
      //   ...(branchCode ? [where('branchCode', '==', branchCode)] : [])
      // );

      // if (dateRange && dateRange[0] && dateRange[1]) {
      //   q = query(
      //     q,
      //     where('date', '>=', dateRange[0].format('YYYY-MM-DD')),
      //     where('date', '<=', dateRange[1].format('YYYY-MM-DD'))
      //   );
      // }

      // const snapshot = await getDocs(q);
      // const attendanceList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // Using mock data for now
      let filteredRecords = mockRecords.filter(
        record => record.provinceId === provinceId && (!branchCode || record.branchCode === branchCode)
      );

      if (dateRange && dateRange[0] && dateRange[1]) {
        filteredRecords = filteredRecords.filter(record => {
          const recordDate = dayjs(record.date);
          return recordDate.isSameOrAfter(dateRange[0]) && recordDate.isSameOrBefore(dateRange[1]);
        });
      }

      setRecords(filteredRecords);
    } catch (error) {
      console.error('Error loading attendance records:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'present':
        return 'green';
      case 'late':
        return 'orange';
      case 'partial':
        return 'yellow';
      case 'absent':
        return 'red';
      default:
        return 'default';
    }
  };

  const formatDuration = (hours: number) => {
    const duration = dayjs.duration(hours, 'hours');
    const h = Math.floor(duration.asHours());
    const m = duration.minutes();
    return `${h}:${m.toString().padStart(2, '0')}`;
  };

  const calculateSummary = () => {
    const totalRecords = filteredRecords.length;
    const presentDays = filteredRecords.filter(r => r.status === 'present').length;
    const lateDays = filteredRecords.filter(r => r.status === 'late').length;
    const absentDays = filteredRecords.filter(r => r.status === 'absent').length;
    const totalHours = filteredRecords.reduce((sum, r) => sum + r.totalHours, 0);
    const totalOvertime = filteredRecords.reduce((sum, r) => sum + r.overtime, 0);

    return {
      totalRecords,
      presentDays,
      lateDays,
      absentDays,
      totalHours,
      totalOvertime,
      attendanceRate: totalRecords > 0 ? ((presentDays + lateDays) / totalRecords) * 100 : 0
    };
  };

  const filteredRecords = records.filter(record => {
    const matchesSearch =
      searchText === '' ||
      record.employeeName.toLowerCase().includes(searchText.toLowerCase()) ||
      record.employeeId.toLowerCase().includes(searchText.toLowerCase());

    const matchesStatus = statusFilter === 'all' || record.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  const summary = calculateSummary();

  const columns = [
    {
      title: t('attendance.table.employee'),
      key: 'employee',
      render: (record: AttendanceRecord) => (
        <div>
          <div style={{ fontWeight: 500 }}>{record.employeeName}</div>
          <div style={{ fontSize: '12px', color: '#666' }}>{record.employeeId}</div>
        </div>
      )
    },
    {
      title: t('attendance.table.date'),
      dataIndex: 'date',
      key: 'date',
      render: (date: string) => dayjs(date).format('DD/MM/YYYY')
    },
    {
      title: t('attendance.table.checkIn'),
      dataIndex: 'checkIn',
      key: 'checkIn',
      render: (time: string) => time || '-'
    },
    {
      title: t('attendance.table.checkOut'),
      dataIndex: 'checkOut',
      key: 'checkOut',
      render: (time: string) => time || '-'
    },
    {
      title: t('attendance.table.totalHours'),
      dataIndex: 'totalHours',
      key: 'totalHours',
      render: (hours: number) => formatDuration(hours)
    },
    {
      title: t('attendance.table.overtime'),
      dataIndex: 'overtime',
      key: 'overtime',
      render: (hours: number) => (hours > 0 ? formatDuration(hours) : '-')
    },
    {
      title: t('attendance.table.status'),
      dataIndex: 'status',
      key: 'status',
      render: (status: string) => <Tag color={getStatusColor(status)}>{t(`attendance.status.${status}`)}</Tag>
    },
    {
      title: t('attendance.table.location'),
      dataIndex: 'location',
      key: 'location',
      ellipsis: {
        showTitle: false
      },
      render: (location: string) => (
        <Tooltip title={location} placement='topLeft'>
          {location}
        </Tooltip>
      )
    },
    {
      title: t('attendance.table.notes'),
      dataIndex: 'notes',
      key: 'notes',
      ellipsis: {
        showTitle: false
      },
      render: (notes: string) =>
        notes ? (
          <Tooltip title={notes} placement='topLeft'>
            {notes}
          </Tooltip>
        ) : (
          '-'
        )
    }
  ];

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

  return (
    <div>
      {/* Summary Cards */}
      <Row gutter={[16, 16]} style={{ marginBottom: 24 }}>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t('attendance.summary.attendanceRate')}
              value={summary.attendanceRate}
              precision={1}
              suffix='%'
              valueStyle={{
                color: summary.attendanceRate >= 95 ? '#3f8600' : summary.attendanceRate >= 85 ? '#cf1322' : '#faad14'
              }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t('attendance.summary.totalHours')}
              value={summary.totalHours}
              precision={1}
              suffix='hrs'
              valueStyle={{ color: '#1890ff' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t('attendance.summary.overtime')}
              value={summary.totalOvertime}
              precision={1}
              suffix='hrs'
              valueStyle={{ color: '#722ed1' }}
            />
          </Card>
        </Col>
        <Col xs={12} sm={6}>
          <Card>
            <Statistic
              title={t('attendance.summary.lateDays')}
              value={summary.lateDays}
              valueStyle={{ color: summary.lateDays > 0 ? '#cf1322' : '#3f8600' }}
            />
          </Card>
        </Col>
      </Row>

      {/* Main Table */}
      <Card>
        <Row justify='space-between' align='middle' style={{ marginBottom: 16 }}>
          <Col>
            <h2 style={{ margin: 0 }}>{t('attendance.recordsTitle')}</h2>
          </Col>
          <Col>
            <Button
              type='primary'
              icon={<DownloadOutlined />}
              onClick={() => {
                // TODO: Implement export functionality
                console.log('Export attendance records');
              }}
            >
              {t('attendance.export')}
            </Button>
          </Col>
        </Row>

        <Row gutter={[16, 16]} style={{ marginBottom: 16 }}>
          <Col xs={24} sm={8}>
            <Search
              placeholder={t('attendance.searchPlaceholder')}
              value={searchText}
              onChange={e => setSearchText(e.target.value)}
              allowClear
            />
          </Col>
          <Col xs={12} sm={4}>
            <Select
              style={{ width: '100%' }}
              placeholder={t('attendance.filterStatus')}
              value={statusFilter}
              onChange={setStatusFilter}
            >
              <Option value='all'>{t('common.all')}</Option>
              <Option value='present'>{t('attendance.status.present')}</Option>
              <Option value='late'>{t('attendance.status.late')}</Option>
              <Option value='partial'>{t('attendance.status.partial')}</Option>
              <Option value='absent'>{t('attendance.status.absent')}</Option>
            </Select>
          </Col>
          <Col xs={12} sm={8}>
            <RangePicker
              style={{ width: '100%' }}
              value={dateRange}
              onChange={setDateRange}
              allowClear
              placeholder={[t('common.startDate'), t('common.endDate')]}
            />
          </Col>
        </Row>

        <Table
          columns={columns}
          dataSource={filteredRecords}
          rowKey='id'
          loading={loading}
          pagination={{
            pageSize: 15,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) =>
              t('common.pagination.total', {
                start: range[0],
                end: range[1],
                total
              })
          }}
          scroll={{ x: 1200 }}
        />
      </Card>
    </div>
  );
};

export default AttendanceRecords;
