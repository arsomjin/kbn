import React from 'react';
import { Form } from 'antd';
import { Row, Col, Card } from 'antd';
import dayjs from 'dayjs';
import { getRules } from '../../../../api/Table';
import CommonSelector from '../../../../components/CommonSelector';
import DepartmentSelector from '../../../../components/DepartmentSelector';
import EmployeeSelector from '../../../../components/EmployeeSelector';
import { Input, InputNumber } from 'antd';
import { Checkbox } from 'antd';
import { User } from '../../../../types/user';
import { InitialLeaveValues } from './types';

/**
 * Leave Types
 */
export type LeaveType = 'ลาป่วย' | 'ลากิจ' | 'ขาดงาน';

/**
 * Initial leave form values
 */
export const InitValue: InitialLeaveValues = {
  branchCode: null,
  date: dayjs().format('YYYY-MM-DD'),
  employeeId: null,
  department: null,
  position: null,
  leaveType: null,
  reason: null,
  leaveDays: null,
  fromDate: undefined,
  toDate: undefined,
  recordedBy: null,
  approvedBy: null,
  hasMedCer: false
};

/**
 * Get initial values for leave form with user-specific defaults
 */
export const getInitialValues = (user: Partial<User>): InitialLeaveValues => {
  const mBranch = (user as any)?.employeeInfo?.branch || '0450';
  return {
    ...InitValue,
    branchCode: mBranch
  };
};

/**
 * Get leave data (placeholder for future API integration)
 */
export const getData = (pCode: string): Promise<any[]> =>
  new Promise(async (resolve, reject) => {
    try {
      resolve([]);
    } catch (e) {
      reject(e);
    }
  });

/**
 * Render input props interface
 */
interface RenderInputProps {
  POSITIONS: string[];
  values: any;
}

/**
 * Render leave form input components
 */
export const renderInput = ({ POSITIONS, values }: RenderInputProps): React.ReactElement => {
  return (
    <Card className='bg-white'>
      <Row gutter={16}>
        <Col md={12}>
          <Form.Item label='ชื่อ-นามสกุล' name='employeeId' rules={getRules(['required'])}>
            <EmployeeSelector style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col md={12}>
          <Form.Item label='ตำแหน่ง' name='position' rules={getRules(['required'])}>
            <CommonSelector size='small' placeholder='ตำแหน่ง' optionData={POSITIONS} className='text-primary' />
          </Form.Item>
        </Col>
        <Col md={12}>
          <Form.Item label='แผนก' name='department'>
            <DepartmentSelector size='small' placeholder='แผนก' />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col md={12}>
          <Form.Item label='ประเภทการลา' name='leaveType' rules={getRules(['required'])}>
            <CommonSelector
              size='small'
              placeholder='ประเภทการลา'
              optionData={['ลาป่วย', 'ลากิจ', 'ขาดงาน']}
              className='text-primary'
            />
          </Form.Item>
        </Col>
        {values?.leaveType === 'ลาป่วย' && (
          <Col md={8}>
            <Form.Item name='hasMedCer' valuePropName='checked'>
              <Checkbox>มีใบรับรองแพทย์</Checkbox>
            </Form.Item>
          </Col>
        )}
      </Row>

      <Row gutter={16}>
        <Col md={24}>
          <Form.Item label='สาเหตุการลา' name='reason'>
            <Input.TextArea rows={3} />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col md={8}>
          <Form.Item label='จำนวนวันลา' name='leaveDays' rules={getRules(['required'])}>
            <InputNumber style={{ width: '100%' }} min={0} />
          </Form.Item>
        </Col>
        <Col md={8}>
          <Form.Item label='จากวันที่' name='fromDate' rules={getRules(['required'])}>
            <Input type='date' />
          </Form.Item>
        </Col>
        <Col md={8}>
          <Form.Item label='ถึงวันที่' name='toDate' rules={getRules(['required'])}>
            <Input type='date' />
          </Form.Item>
        </Col>
      </Row>

      <Row gutter={16}>
        <Col md={12}>
          <Form.Item label='บันทึกโดย' name='recordedBy' rules={getRules(['required'])}>
            <EmployeeSelector placeholder='ผู้บันทึก' />
          </Form.Item>
        </Col>
        <Col md={12}>
          <Form.Item label='อนุมัติโดย' name='approvedBy' rules={getRules(['required'])}>
            <EmployeeSelector placeholder='ผู้อนุมัติ' />
          </Form.Item>
        </Col>
      </Row>
    </Card>
  );
};

/**
 * Table columns configuration for leave records
 */
export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center' as const
  },
  {
    title: 'ชื่อ-นามสกุล',
    dataIndex: 'employeeId',
    align: 'center' as const,
    className: 'text-primary'
  },
  {
    title: 'ตำแหน่ง',
    dataIndex: 'position',
    width: 180,
    align: 'center' as const
  },
  {
    title: 'แผนก',
    dataIndex: 'department',
    align: 'center' as const
  },
  {
    title: 'ประเภทการลา',
    dataIndex: 'leaveType',
    width: 120,
    align: 'center' as const,
    filters: [
      {
        text: 'ลาป่วย',
        value: 'ลาป่วย'
      },
      {
        text: 'ลากิจ',
        value: 'ลากิจ'
      }
    ],
    onFilter: (value: any, record: any) => record.leaveType === value,
    className: 'text-primary'
  },
  {
    title: 'จำนวนวัน',
    dataIndex: 'leaveDays',
    align: 'center' as const,
    width: 100
  },
  {
    title: 'ตั้งแต่วันที่',
    dataIndex: 'fromDate',
    align: 'center' as const,
    width: 120
  },
  {
    title: 'ถึงวันที่',
    dataIndex: 'toDate',
    align: 'center' as const,
    width: 120
  },
  {
    title: 'สาเหตุ',
    dataIndex: 'reason',
    width: 240,
    align: 'center' as const
  }
];
