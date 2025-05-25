import React, { useEffect, useState } from 'react';
import { Collapse, Form, Skeleton, Row as AntRow, notification, DatePicker } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import dayjs from 'dayjs';
import { useTranslation } from 'react-i18next';
import { RootState } from 'store';
import { renderInput, columns, getInitialValues } from './api';
import { CommonSteps, ExtraPositions } from 'data/Constant';
import { getEditArr } from 'utils';
import { cleanValuesBeforeSave } from 'utils/dateHandling';
import { useNavigate, useLocation } from 'react-router-dom';
import EditLeave from './EditLeave';
import EditableCellTable from 'components/EditableCellTable';
import Footer from 'components/common/Footer';

interface LeaveRecord {
  id: number;
  key: string; // Changed from number to string for table compatibility
  _id?: string;
  employeeId: string;
  position?: string;
  department?: string;
  leaveType?: string;
  leaveDays?: number;
  fromDate?: string;
  toDate?: string;
  reason?: string;
  branchCode?: string;
  date?: string;
  editedBy?: any[];
  deleted?: boolean;
}

const initProps = {
  readOnly: false,
  grant: true,
  onBack: null,
  activeStep: 0,
  branchCode: null,
  date: null
};

/**
 * Leave Management Page (migrated, TypeScript, AntD, i18next, RBAC, dayjs)
 */
const Leave: React.FC = () => {
  const { t } = useTranslation(['leave', 'common']);
  const navigate = useNavigate();
  const location = useLocation();
  const params = (location.state as any)?.params || {};
  const user = useSelector((state: RootState) => state.auth.user);
  const employees = useSelector((state: RootState) => state.employees.employees);
  const [form] = Form.useForm();
  const [data, setData] = useState<LeaveRecord[]>([]);
  const [branch, setBranch] = useState((user as any)?.employeeInfo?.branch || '0450');
  const [date, setDate] = useState(dayjs().format('YYYY-MM-DD'));
  const [mProps, setProps] = useState(initProps);
  const [ready, setReady] = useState(false);
  const [loading, setLoading] = useState(false);
  const [lModal, setModal] = useState({ record: {}, visible: false });

  let POSITIONS = Array.from(
    new Set(
      Object.values(employees)
        .map((e: any) => e.position)
        .filter(Boolean)
    )
  );
  POSITIONS = POSITIONS.concat(ExtraPositions);

  useEffect(() => {
    if (params?.branchCode) {
      setProps(prev => ({
        ...prev,
        branchCode: params.branchCode,
        date: params.date,
        activeStep: 1,
        onBack: params.onBack
      }));
      setBranch(params.branchCode);
      setDate(params.date);
    }
    setReady(true);
  }, [params]);

  const _resetToInitial = async () => {
    form.resetFields();
    form.setFieldsValue({ ...getInitialValues(user), branchCode: branch, date });
    setBranch(branch);
    setDate(date);
  };

  // TODO: Replace with Firestore modular SDK and provinceId filtering
  useEffect(() => {
    // Placeholder: fetch leave data from Firestore
    setLoading(false);
  }, [branch, date]);

  const _onValuesChange = (val: any) => {
    const changeKey = Object.keys(val)[0];
    if (changeKey === 'employeeId') {
      if (employees[val['employeeId']]?.position) {
        form.setFieldsValue({ position: employees[val['employeeId']]?.position });
      }
    } else if (changeKey === 'date') {
      setDate(val['date']);
    } else if (changeKey === 'branchCode') {
      setBranch(val['branchCode']);
    } else if (changeKey === 'leaveDays') {
      const fromDate = form.getFieldValue('fromDate');
      if (fromDate && val[changeKey] && Number(val[changeKey]) >= 1) {
        form.setFieldsValue({
          toDate: dayjs(fromDate)
            .add(Number(val[changeKey]) - 1, 'day')
            .format('YYYY-MM-DD')
        });
      }
    } else if (changeKey === 'fromDate') {
      const leaveDays = form.getFieldValue('leaveDays');
      if (leaveDays && Number(leaveDays) >= 1) {
        form.setFieldsValue({
          toDate: dayjs(val[changeKey])
            .add(Number(leaveDays) - 1, 'day')
            .format('YYYY-MM-DD')
        });
      }
    }
  };

  const _onConfirm = async (currentValues: any) => {
    try {
      // TODO: Firestore create logic
      notification.success({ message: t('leave:successTitle', 'บันทึกสำเร็จ') });
      _resetToInitial();
    } catch (e) {
      notification.error({ message: t('leave:errorTitle', 'เกิดข้อผิดพลาด') });
    }
  };

  const _onEdit = async (editValues: any) => {
    try {
      // TODO: Firestore update logic
      setModal({ record: {}, visible: false });
      notification.success({ message: t('leave:editSuccess', 'บันทึกข้อมูลสำเร็จ') });
    } catch (e) {
      notification.error({ message: t('leave:errorTitle', 'เกิดข้อผิดพลาด') });
    }
  };

  const handleSelect = (rec: LeaveRecord) => {
    if (rec.deleted) {
      notification.warning({ message: t('leave:deletedRecord', 'ลบรายการแล้ว') });
      return;
    }
    setModal({ record: rec, visible: true });
  };

  if (!ready) return <Skeleton active />;

  return (
    <div className='main-content-container p-3'>
      <Form form={form} initialValues={getInitialValues(user)} size='small' onValuesChange={_onValuesChange}>
        <div className='px-3 bg-white'>
          <Form.Item name='date' label={t('common:date', 'วันที่')}>
            <DatePicker />
          </Form.Item>
        </div>
        <Collapse>
          <Collapse.Panel header={t('leave:formHeader', 'บันทึกข้อมูล')} key='1'>
            <Form.Item shouldUpdate>
              {() => {
                const values = form.getFieldsValue();
                return (
                  <>
                    {renderInput({ POSITIONS, values })}
                    <Footer
                      onConfirm={() => _onConfirm(values)}
                      onCancel={_resetToInitial}
                      cancelText={t('common:clear', 'ล้างข้อมูล')}
                      cancelPopConfirmText={t('common:clearConfirm', 'ล้าง?')}
                      okPopConfirmText={t('common:confirm', 'ยืนยัน?')}
                      okIcon={<PlusOutlined />}
                    />
                  </>
                );
              }}
            </Form.Item>
          </Collapse.Panel>
        </Collapse>
      </Form>
      <div className='mt-3' />
      <EditableCellTable
        dataSource={data}
        columns={columns}
        onRow={(record: LeaveRecord) => ({ onClick: () => handleSelect(record) })}
        hasEdit
        loading={loading}
        pagination={{ pageSize: 20, hideOnSinglePage: true }}
      />
      <EditLeave
        selectedData={lModal.record}
        visible={lModal.visible}
        onOk={_onEdit}
        onCancel={() => setModal({ record: {}, visible: false })}
        POSITIONS={POSITIONS}
        grant={initProps.grant}
      />
    </div>
  );
};

export default Leave;
