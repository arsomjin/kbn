import React from 'react';
import 'antd/dist/antd.css';
import { Table } from 'antd';
import EditableTable from './EditableRows';

const columns = [
  { title: 'รายการ', dataIndex: 'name', key: 'name' },
  { title: 'รวมเงิน', dataIndex: 'total', key: 'total' }
  //   { title: 'Address', dataIndex: 'address', key: 'address' },
  //   {
  //     title: 'Action',
  //     dataIndex: '',
  //     key: 'x',
  //     render: () => <a>Delete</a>,
  //   },
];

const data = [
  {
    key: 1,
    name: 'เงินเดือนและค่าประกันสังคม',
    total: 32,
    address: 'New York No. 1 Lake Park',
    description: 'My name is John Brown, I am 32 years old, living in New York No. 1 Lake Park.'
  },
  {
    key: 2,
    name: 'ค่าใช้จ่ายภาษีและค่าบริการด้านบัญชี',
    total: 42,
    address: 'London No. 1 Lake Park',
    description: 'My name is Jim Green, I am 42 years old, living in London No. 1 Lake Park.'
  },
  {
    key: 3,
    name: 'ค่าใช้จ่ายในการบำรุงรักษารถใช้งาน',
    total: 29,
    address: 'Jiangsu No. 1 Lake Park',
    description: 'This not expandable'
  },
  {
    key: 4,
    name: 'ค่าน้ำมัน รถใช้งาน/รถขนส่ง / รถบริการ',
    total: 32,
    address: 'Sidney No. 1 Lake Park',
    description: 'My name is Joe Black, I am 32 years old, living in Sidney No. 1 Lake Park.'
  }
];

const DataTable = () => {
  return (
    <div>
      <Table
        columns={columns}
        expandable={{
          expandedRowRender: record => (
            // <p style={{ margin: 0 }}>{record.description}</p>
            <EditableTable data={record} />
          ),
          rowExpandable: record => record.name !== 'Not Expandable'
        }}
        dataSource={data}
      />
    </div>
  );
};

export default DataTable;
