import React from 'react';
import { Row, Col, InputGroup } from 'shards-react';
import { Form } from 'antd';
import { getRules } from 'api/Table';

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'วันที่',
    dataIndex: 'date',
    align: 'center'
  },
  {
    title: 'สาขา',
    dataIndex: 'branchCode',
    align: 'center'
  },
  {
    title: 'ประเภทการขาย',
    dataIndex: 'saleType',
    align: 'center'
  },
  {
    title: 'เลขที่ใบขาย',
    dataIndex: 'saleNo',
    align: 'center'
  },
  {
    title: 'รหัสสินค้า',
    ellipsis: true,
    dataIndex: 'productCode'
  },
  {
    title: 'ชื่อสินค้า',
    dataIndex: 'productName',
    ellipsis: true
  },
  {
    title: 'จำนวน',
    dataIndex: 'qty'
  },
  {
    title: 'จำนวนเงิน',
    dataIndex: 'total'
  }
];

export const renderInput = (values, form) => {
  return (
    <div className="bg-white">
      <div className="px-3 bg-white border mb-3 pt-4">
        <Row>
          {/* <Col md="4">
            <Form.Item name="date" rules={getRules(['required'])}>
              <InputGroup
                spans={[10, 14]}
                addonBefore="วันที่เอกสาร"
                inputComponent={(props) => <DatePicker {...props} />}
              />
            </Form.Item>
          </Col> */}
          <Col md="6">
            <Form.Item name="docNo" rules={getRules(['required'])}>
              <InputGroup spans={[10, 14]} addonBefore="เลขที่เอกสาร" />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item
              name="toDestination"
              rules={[
                {
                  required: ['sold', 'transfer'].includes(values.transferType),
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <InputGroup
                spans={[10, 14]}
                addonBefore={values.transferType === 'sold' ? 'ชื่อลูกค้า' : 'สาขาปลายทาง'}
                {...(['sold', 'transfer'].includes(values.transferType) &&
                  (values.transferType === 'sold' ? { customer: true } : { branch: true }))}
              />
            </Form.Item>
          </Col>
          {/* <Col md="6">
          <Form.Item name="transferType" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="ประเภทการเคลื่อนไหว"
              transferType
            />
          </Form.Item>
        </Col> */}
        </Row>
        {['sold'].includes(values.transferType) && (
          <Row>
            <Col md="6">
              <Form.Item name="saleType">
                <InputGroup
                  spans={[10, 14]}
                  addonBefore="ประเภทการขาย"
                  placeholder="ประเภทการขาย"
                  alignRight
                  saleType
                />
              </Form.Item>
            </Col>
          </Row>
        )}
      </div>
      {/* <div className="px-3 bg-white border mt-3 pt-4">
        <Row>
          <Col md="6">
            <Form.Item name="recordedBy" rules={getRules(['required'])}>
              <InputGroup
                spans={[10, 14]}
                addonBefore="ผู้ออกบิล"
                inputComponent={(props) => <EmployeeSelector {...props} />}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="verifiedBy" rules={getRules(['required'])}>
              <InputGroup
                spans={[10, 14]}
                addonBefore="ผู้ตรวจสินค้า"
                inputComponent={(props) => <EmployeeSelector {...props} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="deliveredBy" rules={getRules(['required'])}>
              <InputGroup
                spans={[10, 14]}
                addonBefore="พนักงานขนส่ง"
                inputComponent={(props) => <EmployeeSelector {...props} />}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="remark" label="หมายเหตุ">
              <Input placeholder="หมายเหตุ" />
            </Form.Item>
          </Col>
        </Row>
      </div> */}
    </div>
  );
};
