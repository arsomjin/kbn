import React from 'react';
import dayjs from 'dayjs';
import { Row, Col } from 'antd';
import { Form, DatePicker } from 'antd';
import { Typography } from 'antd';
import { useTranslation } from 'react-i18next';
import { AttendanceRecord, SearchFormValues } from './types';

const { Text } = Typography;

export interface SearchValues {
  startDate: string;
  endDate: string;
}

export const initSearchValue: SearchValues = {
  startDate: dayjs().format('YYYY-MM-DD'),
  endDate: dayjs().format('YYYY-MM-DD')
};

export const getColumns = (data: AttendanceRecord[]) => [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center' as const,
    width: 60
  },
  {
    title: 'วันที่',
    dataIndex: 'date',
    align: 'center' as const,
    filters: Array.from(new Set(data.map(item => item.date)))
      .map(date => ({
        value: date,
        text: dayjs(date, 'YYYY-MM-DD').format('DD/MM/YYYY')
      })),
    onFilter: (value: any, record: AttendanceRecord) => record.date === value
  },
  {
    title: 'สาขา',
    dataIndex: 'branch',
    width: 120,
    align: 'center' as const,
    filters: Array.from(new Set(data.map(item => item.branch)))
      .map(branch => ({
        value: branch,
        text: branch
      })),
    onFilter: (value: any, record: AttendanceRecord) => record.branch === value
  },
  {
    title: 'รหัสพนักงาน',
    dataIndex: 'employeeCode',
    render: (txt: string) => <div>{txt}</div>,
    width: 80,
    align: 'center' as const,
    filters: Array.from(new Set(data.map(item => item.employeeCode)))
      .map(employeeCode => ({
        value: employeeCode,
        text: employeeCode
      })),
    onFilter: (value: any, record: AttendanceRecord) => record.employeeCode === value
  },
  {
    title: 'ชื่อ-นามสกุล',
    dataIndex: 'fullName',
    width: 160
  }
];

export const renderHeader = (): React.ReactElement => (
  <div className="bg-white pt-3 px-4 border-bottom">
    <Row>
      <Col md={12} lg={6}>
        <Form.Item
          name="startDate"
          label={
            <span role="img">
              🔍 <Text className="ml-2">วันที่</Text>
            </span>
          }
        >
          <DatePicker placeholder="ค้นหาจาก วันที่" />
        </Form.Item>
      </Col>
      <Col md={12} lg={6}>
        <Form.Item name="endDate" label="ถึง วันที่">
          <DatePicker placeholder="ถึง วันที่" />
        </Form.Item>
      </Col>
    </Row>
  </div>
);

export const getTitleFromPath = (path: string): string => {
  switch (path) {
    case '/service-data-skc':
      return 'ในศูนย์';
    case '/service-input':
      return 'นอกพื้นที่';
    default:
      return 'รายได้';
  }
};
