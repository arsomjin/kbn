import React from 'react';
import moment from 'moment';
import { Row, Col } from 'shards-react';
import { Form } from 'antd';
import { DatePicker } from 'elements';
import Text from 'antd/lib/typography/Text';
import { distinctArr } from 'functions';

export const initSearchValue = {
  startDate: moment().format('YYYY-MM-DD'),
  endDate: moment().format('YYYY-MM-DD')
};

export const getColumns = data => [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center',
    width: 60
  },
  {
    title: 'วันที่',
    dataIndex: 'date',
    align: 'center',
    filters: distinctArr(data, ['date']).map(it => ({
      value: it.date,
      text: moment(it.date, 'YYYY-MM-DD').format('DD/MM/YYYY')
    })),
    onFilter: (value, record) => record.date === value
  },
  {
    title: 'สาขา',
    dataIndex: 'branch',
    width: 120,
    align: 'center',
    filters: distinctArr(data, ['branch']).map(it => ({
      value: it.branch,
      text: it.branch
    })),
    onFilter: (value, record) => record.branch === value
  },
  {
    title: 'รหัสพนักงาน',
    dataIndex: 'employeeCode',
    render: txt => <div>{txt}</div>,
    width: 80,
    align: 'center',
    filters: distinctArr(data, ['employeeCode']).map(it => ({
      value: it.employeeCode,
      text: it.employeeCode
    })),
    onFilter: (value, record) => record.employeeCode === value
  },
  {
    title: 'ชื่อ-นามสกุล',
    dataIndex: 'fullName',
    width: 160
  }
];

export const renderHeader = () => (
  <div className="bg-white pt-3 px-4 border-bottom">
    <Row>
      <Col md="2">
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
      <Col md="2">
        <Form.Item name="endDate" label="ถึง วันที่">
          <DatePicker placeholder="ถึง วันที่" />
        </Form.Item>
      </Col>
    </Row>
  </div>
);

export const getTitleFromPath = path => {
  switch (path) {
    case '/service-data-skc':
      return 'ในศูนย์';
    case '/service-input':
      return 'นอกพื้นที่';

    default:
      return 'รายได้';
  }
};
