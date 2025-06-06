import moment from 'moment';
import React from 'react';
import { Row, Col } from 'shards-react';
import { Form } from 'antd';
import { DatePicker } from 'elements';
import BranchSelector from 'components/BranchSelector';

export const initSearchValue = {
  startDate: moment().format('YYYY-MM-DD'),
  endDate: moment().format('YYYY-MM-DD'),
  branchCode: null
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่',
    dataIndex: 'saleDate'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center'
  },
  {
    title: 'ประเภทลูกค้า',
    dataIndex: 'sourceOfData'
  },
  {
    title: 'อะไหล่',
    dataIndex: 'amtPartType',
    align: 'right'
  },
  {
    title: 'น้ำมัน',
    dataIndex: 'amtOilType',
    align: 'right'
  },
  {
    title: 'รวมยอดขาย',
    dataIndex: 'netTotal',
    align: 'right'
  }
];

export const discountColumns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่',
    dataIndex: 'saleDate'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center'
  },
  {
    title: 'ส่วนลดคูปอง',
    dataIndex: 'discountCoupon',
    align: 'right'
  },
  {
    title: 'ส่วนลดจากการใช้คะแนน',
    dataIndex: 'discountPointRedeem',
    align: 'right'
  },
  {
    title: 'ส่วนลด SKC Manual',
    dataIndex: 'SKCManualDiscount',
    align: 'right'
  },
  {
    title: 'ส่วนลด SKC',
    dataIndex: 'SKCDiscount',
    align: 'right'
  },
  {
    title: 'ส่วนลด AD',
    dataIndex: 'AD_Discount',
    align: 'right'
  }
  //   {
  //     title: 'รวมยอดขาย',
  //     dataIndex: 'netTotal',
  //   },
];

export const renderHeader = () => (
  <div className="bg-white pt-3 px-4 border-bottom">
    {/* <Row>
      <Col md="4">
        <Form.Item name="saleNo" label="🔍 ค้นหาจาก เลขที่ใบขายสินค้า">
          <DocSelector
            collection="sections/sales/vehicles"
            orderBy={['saleNo', 'firstName']}
            wheres={[['saleType', '==', saleType]]}
            size="small"
            hasAll
            hasKeywords
          />
        </Form.Item>
      </Col> */}
    <Row>
      <Col md="2">
        <Form.Item name="startDate" label="🔍 ค้นหาจาก วันที่">
          <DatePicker placeholder="ค้นหาจาก วันที่" />
        </Form.Item>
      </Col>
      <Col md="2">
        <Form.Item name="endDate" label="ถึง วันที่">
          <DatePicker placeholder="ถึง วันที่" />
        </Form.Item>
      </Col>
      <Col md="4">
        <Form.Item name="branchCode" label="🔍 ค้นหาจาก สาขา">
          <BranchSelector placeholder="ค้นหาจาก สาขา" hasAll />
        </Form.Item>
      </Col>
    </Row>
  </div>
);
