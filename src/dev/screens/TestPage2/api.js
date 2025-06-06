import React from 'react';
import { Tag, Form } from 'antd';
import { Row, Col } from 'shards-react';
import moment from 'moment';
import { DatePicker } from 'elements';
import CustomerSelector from 'Modules/Customers/CustomerSelector';
import SaleTypeSelector from 'components/SaleTypeSelector';
import BranchSelector from 'components/BranchSelector';
import DocSelector from 'components/DocSelector';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่',
    dataIndex: 'date'
  },
  {
    title: 'เลขที่ใบขาย',
    dataIndex: 'saleNo'
  },
  {
    title: 'ประเภท',
    dataIndex: 'saleType'
  },
  {
    title: 'รุ่น/เลขรถ',
    dataIndex: 'vehicleId'
  },
  {
    title: 'เลขอุปกรณ์',
    dataIndex: 'peripheralId'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode'
  },
  {
    title: 'ชื่อ',
    dataIndex: 'firstName'
  },
  {
    title: 'นามสกุล',
    dataIndex: 'lastName'
  },
  {
    title: 'ราคาสินค้า',
    dataIndex: 'amtFull'
  }
];

export const expandedRowRender = record => (
  <div className="ml-4 bg-light bordered pb-1">
    {record?.receiveNo && <Tag>{`เลขที่ใบรับสินค้า: ${record.receiveNo}`}</Tag>}
    {record?.billNoSKC && <Tag>{`เลขที่ใบรับสินค้า: ${record.billNoSKC}`}</Tag>}
    {record?.branch && <Tag>{`สาขาที่รับสินค้า: ${record.branch}`}</Tag>}
    {record?.inputDate && <Tag>{`วันที่คีย์: ${moment(record.inputDate, 'YYYY-MM-DD').format('DD/MM/YYYY')}`}</Tag>}
    {record?.vehicleId && <Tag>{`หมายเลขรถ: ${record.vehicleId}`}</Tag>}
    {record?.vehicleId && <Tag>{`เลขอุปกรณ์ต่อพ่วง: ${record.peripheralNo}`}</Tag>}
  </div>
);

export const initSearchValue = {
  customerId: null,
  saleNo: null,
  saleType: null,
  startDate: moment().format('YYYY-MM-DD'),
  endDate: moment().format('YYYY-MM-DD'),
  branchCode: null
};

export const renderHeader = () => (
  <div className="border-bottom bg-white px-3 pt-3">
    <Row>
      <Col md="4">
        <Form.Item name="saleNo" label="🔍  เลขที่ใบขายสินค้า">
          <DocSelector
            collection="sections/sales/vehicles"
            orderBy="saleNo"
            // wheres={['leasingRec' , '==', null]}
            size="small"
            hasAll
            hasKeywords
          />
        </Form.Item>
      </Col>
      <Col md="4">
        <Form.Item name="customerId" label="🔍  ลูกค้า">
          <CustomerSelector hasAll />
        </Form.Item>
      </Col>
      <Col md="4">
        <Form.Item name="saleType" label="ประเภทการขาย">
          <SaleTypeSelector hasAll onlyLeasing includeReservation />
        </Form.Item>
      </Col>
    </Row>
    <Row>
      <Col md="2">
        <Form.Item name="startDate" label="🔍  วันที่">
          <DatePicker placeholder="ค้นหาจาก วันที่" />
        </Form.Item>
      </Col>
      <Col md="2">
        <Form.Item name="endDate" label="ถึง วันที่">
          <DatePicker placeholder="ถึง วันที่" />
        </Form.Item>
      </Col>
      <Col md="4">
        <Form.Item name="branchCode" label="🔍  สาขา">
          <BranchSelector placeholder="ค้นหาจาก สาขา" hasAll />
        </Form.Item>
      </Col>
    </Row>
  </div>
);
