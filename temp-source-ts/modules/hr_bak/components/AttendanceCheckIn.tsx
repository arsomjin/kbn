import React, { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { useParams } from 'react-router-dom';
import {
  Card,
  Button,
  Space,
  Typography,
  Alert,
  Row,
  Col,
  Statistic,
  Timeline,
  notification,
  Modal,
  Form,
  Input,
  Radio
} from 'antd';
import {
  ClockCircleOutlined,
  LoginOutlined,
  LogoutOutlined,
  CalendarOutlined,
  EnvironmentOutlined
} from '@ant-design/icons';
import { useAuth } from '../../../contexts/AuthContext';
import { hasPermission, hasProvinceAccess } from '../../../utils/permissions';
import { PERMISSIONS } from '../../../constants/Permissions';
import dayjs from 'dayjs';

const { Title, Text } = Typography;
const { TextArea } = Input;

interface AttendanceRecord {
  id: string;
  employeeId: string;
  date: string;
  checkIn?: string;
  checkOut?: string;
  breakStart?: string;
  breakEnd?: string;
  totalHours?: number;
  overtime?: number;
  location?: string;
  notes?: string;
  status: 'present' | 'absent' | 'late' | 'partial';
  provinceId: string;
  branchCode?: string;
  createdAt: string;
  updatedAt: string;
}

interface CheckInData {
  type: 'check-in' | 'check-out' | 'break-start' | 'break-end';
  location: string;
  notes?: string;
}

/**
 * Attendance Check-in Component
 */
export const AttendanceCheckIn: React.FC = () => {
  const { t } = useTranslation(['hr', 'common']);
  const { provinceId, branchCode } = useParams<{ provinceId: string; branchCode?: string }>();
  const { userProfile } = useAuth();

  const [currentTime, setCurrentTime] = useState(dayjs());
  const [todaysRecord, setTodaysRecord] = useState<AttendanceRecord | null>(null);
  const [loading, setLoading] = useState(false);
  const [location, setLocation] = useState<string>('');
  const [checkInModalVisible, setCheckInModalVisible] = useState(false);
  const [checkInType, setCheckInType] = useState<'check-in' | 'check-out' | 'break-start' | 'break-end'>('check-in');
  const [form] = Form.useForm();

  // Check permissions
  const canCreate = hasPermission(userProfile, PERMISSIONS.ATTENDANCE_CREATE);
  const hasProvinceAccessCheck = provinceId ? hasProvinceAccess(userProfile, provinceId) : true;

  // Update time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(dayjs());
    }, 1000);

    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    if (canCreate && hasProvinceAccessCheck) {
      loadTodaysRecord();
      getCurrentLocation();
    }
  }, [canCreate, hasProvinceAccessCheck, provinceId, branchCode]);

  const loadTodaysRecord = async () => {
    try {
      const today = dayjs().format('YYYY-MM-DD');

      // TODO: Load from Firebase
      // const attendanceRef = collection(db, 'data', provinceId!, 'attendance');
      // const q = query(
      //   attendanceRef,
      //   where('employeeId', '==', userProfile?.uid),
      //   where('date', '==', today),
      //   where('provinceId', '==', provinceId)
      // );
      // const snapshot = await getDocs(q);
      // if (!snapshot.empty) {
      //   setTodaysRecord({ id: snapshot.docs[0].id, ...snapshot.docs[0].data() });
      // }

      // Mock data for development
      const mockRecord: AttendanceRecord = {
        id: '1',
        employeeId: userProfile?.uid || '',
        date: today,
        checkIn: '09:00:00',
        status: 'present',
        location: 'Bangkok Office',
        provinceId: provinceId || 'bangkok',
        branchCode: branchCode,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };

      // Only set if it's a real work day scenario
      if (currentTime.hour() >= 8) {
        setTodaysRecord(mockRecord);
      }
    } catch (error) {
      console.error("Error loading today's attendance:", error);
    }
  };

  const getCurrentLocation = () => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        position => {
          // This would typically convert to address
          setLocation(`${position.coords.latitude}, ${position.coords.longitude}`);
        },
        error => {
          console.log('Location error:', error);
          setLocation('Location not available');
        }
      );
    } else {
      setLocation('Geolocation not supported');
    }
  };

  const handleCheckInOut = (type: 'check-in' | 'check-out' | 'break-start' | 'break-end') => {
    setCheckInType(type);
    form.resetFields();
    form.setFieldsValue({
      type,
      location
    });
    setCheckInModalVisible(true);
  };

  const submitCheckInOut = async (values: CheckInData) => {
    try {
      setLoading(true);

      const now = dayjs();
      const timeString = now.format('HH:mm:ss');
      const today = now.format('YYYY-MM-DD');

      const attendanceData = {
        employeeId: userProfile?.uid || '',
        date: today,
        [values.type === 'check-in'
          ? 'checkIn'
          : values.type === 'check-out'
            ? 'checkOut'
            : values.type === 'break-start'
              ? 'breakStart'
              : 'breakEnd']: timeString,
        location: values.location,
        notes: values.notes,
        provinceId: provinceId!,
        branchCode,
        updatedAt: new Date().toISOString(),
        ...(todaysRecord
          ? {}
          : {
              createdAt: new Date().toISOString(),
              status: 'present'
            })
      };

      // TODO: Submit to Firebase
      // if (todaysRecord) {
      //   await updateDoc(doc(db, 'data', provinceId!, 'attendance', todaysRecord.id), attendanceData);
      // } else {
      //   await addDoc(collection(db, 'data', provinceId!, 'attendance'), attendanceData);
      // }

      notification.success({
        message: t(`attendance.${values.type.replace('-', '')}Success`),
        description: t('attendance.timeRecorded', { time: timeString })
      });

      setCheckInModalVisible(false);
      loadTodaysRecord();
    } catch (error) {
      console.error('Error recording attendance:', error);
      notification.error({
        message: t('attendance.error.recordFailed'),
        description: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  const calculateWorkingHours = () => {
    if (!todaysRecord?.checkIn) return 0;

    const checkIn = dayjs(`${todaysRecord.date} ${todaysRecord.checkIn}`);
    const checkOut = todaysRecord.checkOut ? dayjs(`${todaysRecord.date} ${todaysRecord.checkOut}`) : currentTime;

    let workingMinutes = checkOut.diff(checkIn, 'minute');

    // Subtract break time if exists
    if (todaysRecord.breakStart && todaysRecord.breakEnd) {
      const breakStart = dayjs(`${todaysRecord.date} ${todaysRecord.breakStart}`);
      const breakEnd = dayjs(`${todaysRecord.date} ${todaysRecord.breakEnd}`);
      const breakMinutes = breakEnd.diff(breakStart, 'minute');
      workingMinutes -= breakMinutes;
    }

    return Math.max(0, workingMinutes / 60);
  };

  const getAttendanceStatus = () => {
    if (!todaysRecord) return 'not-started';
    if (todaysRecord.checkOut) return 'completed';
    if (todaysRecord.breakStart && !todaysRecord.breakEnd) return 'on-break';
    return 'working';
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'not-started':
        return '#ccc';
      case 'working':
        return '#52c41a';
      case 'on-break':
        return '#faad14';
      case 'completed':
        return '#1890ff';
      default:
        return '#ccc';
    }
  };

  if (!canCreate || !hasProvinceAccessCheck) {
    return (
      <Card>
        <div style={{ textAlign: 'center', padding: '50px 0' }}>
          <h3>{t('common.accessDenied')}</h3>
          <p>{t('common.insufficientPermissions')}</p>
        </div>
      </Card>
    );
  }

  const status = getAttendanceStatus();
  const workingHours = calculateWorkingHours();

  return (
    <div>
      <Row gutter={[16, 16]}>
        <Col xs={24} lg={16}>
          <Card>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
              <Title level={2}>{currentTime.format('HH:mm:ss')}</Title>
              <Text type='secondary'>{currentTime.format('dddd, DD MMMM YYYY')}</Text>
            </div>

            <Alert
              message={t(`attendance.status.${status}`)}
              type={status === 'working' ? 'success' : status === 'on-break' ? 'warning' : 'info'}
              showIcon
              style={{ marginBottom: 24 }}
            />

            <Row gutter={[16, 16]}>
              <Col xs={12} sm={6}>
                <Button
                  type='primary'
                  size='large'
                  icon={<LoginOutlined />}
                  onClick={() => handleCheckInOut('check-in')}
                  disabled={!!todaysRecord?.checkIn}
                  style={{ width: '100%' }}
                >
                  {t('attendance.checkIn')}
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  size='large'
                  icon={<ClockCircleOutlined />}
                  onClick={() => handleCheckInOut('break-start')}
                  disabled={!todaysRecord?.checkIn || !!todaysRecord?.checkOut || !!todaysRecord?.breakStart}
                  style={{ width: '100%' }}
                >
                  {t('attendance.startBreak')}
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  size='large'
                  icon={<ClockCircleOutlined />}
                  onClick={() => handleCheckInOut('break-end')}
                  disabled={!todaysRecord?.breakStart || !!todaysRecord?.breakEnd}
                  style={{ width: '100%' }}
                >
                  {t('attendance.endBreak')}
                </Button>
              </Col>
              <Col xs={12} sm={6}>
                <Button
                  type='primary'
                  danger
                  size='large'
                  icon={<LogoutOutlined />}
                  onClick={() => handleCheckInOut('check-out')}
                  disabled={!todaysRecord?.checkIn || !!todaysRecord?.checkOut}
                  style={{ width: '100%' }}
                >
                  {t('attendance.checkOut')}
                </Button>
              </Col>
            </Row>
          </Card>
        </Col>

        <Col xs={24} lg={8}>
          <Card title={t('attendance.todaysSummary')}>
            <Row gutter={[16, 16]}>
              <Col span={24}>
                <Statistic
                  title={t('attendance.workingHours')}
                  value={workingHours}
                  precision={2}
                  suffix='hrs'
                  valueStyle={{ color: getStatusColor(status) }}
                />
              </Col>
            </Row>

            {todaysRecord && (
              <Timeline style={{ marginTop: 24 }}>
                {todaysRecord.checkIn && (
                  <Timeline.Item dot={<LoginOutlined style={{ color: '#52c41a' }} />} color='green'>
                    <div>
                      <Text strong>{t('attendance.checkedIn')}</Text>
                      <br />
                      <Text type='secondary'>{todaysRecord.checkIn}</Text>
                      {todaysRecord.location && (
                        <>
                          <br />
                          <Text type='secondary'>
                            <EnvironmentOutlined /> {todaysRecord.location}
                          </Text>
                        </>
                      )}
                    </div>
                  </Timeline.Item>
                )}

                {todaysRecord.breakStart && (
                  <Timeline.Item dot={<ClockCircleOutlined style={{ color: '#faad14' }} />} color='orange'>
                    <div>
                      <Text strong>{t('attendance.breakStarted')}</Text>
                      <br />
                      <Text type='secondary'>{todaysRecord.breakStart}</Text>
                    </div>
                  </Timeline.Item>
                )}

                {todaysRecord.breakEnd && (
                  <Timeline.Item dot={<ClockCircleOutlined style={{ color: '#52c41a' }} />} color='green'>
                    <div>
                      <Text strong>{t('attendance.breakEnded')}</Text>
                      <br />
                      <Text type='secondary'>{todaysRecord.breakEnd}</Text>
                    </div>
                  </Timeline.Item>
                )}

                {todaysRecord.checkOut && (
                  <Timeline.Item dot={<LogoutOutlined style={{ color: '#1890ff' }} />} color='blue'>
                    <div>
                      <Text strong>{t('attendance.checkedOut')}</Text>
                      <br />
                      <Text type='secondary'>{todaysRecord.checkOut}</Text>
                    </div>
                  </Timeline.Item>
                )}
              </Timeline>
            )}
          </Card>
        </Col>
      </Row>

      <Modal
        title={t(`attendance.${checkInType.replace('-', '')}Title`)}
        open={checkInModalVisible}
        onCancel={() => setCheckInModalVisible(false)}
        footer={null}
      >
        <Form form={form} layout='vertical' onFinish={submitCheckInOut}>
          <Form.Item name='type' label={t('attendance.form.type')}>
            <Radio.Group disabled>
              <Radio value='check-in'>{t('attendance.checkIn')}</Radio>
              <Radio value='check-out'>{t('attendance.checkOut')}</Radio>
              <Radio value='break-start'>{t('attendance.startBreak')}</Radio>
              <Radio value='break-end'>{t('attendance.endBreak')}</Radio>
            </Radio.Group>
          </Form.Item>

          <Form.Item
            name='location'
            label={t('attendance.form.location')}
            rules={[{ required: true, message: t('attendance.form.locationRequired') }]}
          >
            <Input prefix={<EnvironmentOutlined />} />
          </Form.Item>

          <Form.Item name='notes' label={t('attendance.form.notes')}>
            <TextArea rows={3} placeholder={t('attendance.form.notesPlaceholder')} />
          </Form.Item>

          <Form.Item style={{ marginBottom: 0, textAlign: 'right' }}>
            <Space>
              <Button onClick={() => setCheckInModalVisible(false)}>{t('common.cancel')}</Button>
              <Button type='primary' htmlType='submit' loading={loading}>
                {t('attendance.confirm')}
              </Button>
            </Space>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
};

export default AttendanceCheckIn;
