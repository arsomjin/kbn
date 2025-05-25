import React from 'react';

import { Col, Row, Table } from 'antd';
import 'antd/dist/antd.css';

const tableData = [
  {
    id: 1,
    name: 'Accommodation (Single Occupancy)',
    description: 'Accommodation',
    price: 1599,
    quantity: 1
  },
  {
    id: 2,
    name: 'Accommodation (Single Occupancy) Second row',
    description: 'Accommodation',
    price: 1569,
    quantity: 10
  }
];

const tableColumns = [
  {
    title: 'Items',
    dataIndex: 'name',
    key: 'name',
    width: '40%'
  },
  {
    title: 'Description',
    dataIndex: 'description',
    key: 'description',
    width: '30%'
  },
  {
    title: 'Quantity',
    dataIndex: 'quantity',
    key: 'quantity',
    width: '10%'
  },
  {
    title: 'Price',
    dataIndex: 'price',
    key: 'price',
    width: '10%'
  },
  {
    title: 'Line Total',
    width: '10%'
  }
];

export class SampleReceipt extends React.PureComponent {
  render() {
    return (
      <div style={{ padding: 48 }}>
        <Row style={{ justifyContent: 'center' }}>
          <Col style={{ alignItems: 'center' }}>
            <h3>บริษัท คูโบต้าเบญจพลนครราชสีมา จำกัด</h3>
            <h5 className='text-muted text-center'>Kubota Benjaphon Nakhonratchasima Co., Ltd.</h5>
          </Col>
        </Row>

        <Row gutter={24} style={{ marginTop: 32 }}>
          <Col span={8}>
            <h3>Eco Haya</h3>
            <div>#944/945, 4th Cross, 9th Main,</div>
            <div>Vijaya Bank Layout,</div>
            <div>Bannerghatta Road,</div>
            <div>Bangalore - 560076</div>
          </Col>
          <Col span={8} offset={8}>
            <table
              style={{
                width: '100%'
              }}
            >
              <tr>
                <th className='text-right'>Invoice # :</th>
                <td className='text-right'>1</td>
              </tr>
              <tr>
                <th className='text-right'>Invoice Date :</th>
                <td className='text-right'>10-01-2018</td>
              </tr>
              <tr>
                <th className='text-right'>Due Date :</th>
                <td className='text-right'>10-01-2018</td>
              </tr>
            </table>
          </Col>
        </Row>

        <Row style={{ marginTop: 48 }}>
          <div>
            Bill To: <strong>Strides Shasun Ltd</strong>
          </div>
          <div>Bannerghatt Road,</div>
          <div>Bangalore - 560076</div>
        </Row>

        <Row style={{ marginTop: 48 }}>
          <Table dataSource={tableData} columns={tableColumns} pagination={false} style={{ width: '100%' }} />
        </Row>

        <Row style={{ marginTop: 48 }}>
          <Col span={8} offset={16}>
            <table
              style={{
                width: '100%'
              }}
            >
              <tr>
                <th className='text-right'>Gross Total :</th>
                <td className='text-right'>Rs. 1599</td>
              </tr>
              <tr>
                <th className='text-right'>IGST @6% :</th>
                <td className='text-right'>Rs. 95.94</td>
              </tr>
              <tr>
                <th className='text-right'>CGST @6% :</th>
                <td className='text-right'>Rs. 95.94</td>
              </tr>
              <tr>
                <th className='text-right'>Nett Total :</th>
                <td className='text-right'>Rs. 1790.88</td>
              </tr>
            </table>
          </Col>
        </Row>

        <Row
          style={{
            marginTop: 48,
            justifyContent: 'center'
          }}
        >
          notes
        </Row>

        <Row style={{ marginTop: 48, justifyContent: 'center' }}>Footer</Row>
      </div>
    );
  }
}
