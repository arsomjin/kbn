import React from 'react';
import { Form, Radio } from 'antd';
import { Row, Col } from 'shards-react';
import { DatePicker, Input } from 'elements';
import CustomerSelector from 'Modules/Customers/CustomerSelector';
import DocSelector from 'components/DocSelector';
import { InputGroup } from 'elements';
import EmployeeSelector from 'components/EmployeeSelector';
import { getRules } from 'api/Table';
import { showLog } from 'functions';
import { Name } from 'components/NameAddress';
import { Address } from 'components/NameAddress';
import { SearchOutlined } from '@ant-design/icons';

export const initSearchValue = {
  searchCustomerId: null,
  searchSaleNo: null
};

export const initValues = {
  saleId: null,
  saleNo: null,
  productCode: null,
  vehicleNo: null,
  peripheralNo: null,
  engineNo: null,
  pressureBladeNo: null,
  bucketNo: null,
  sugarcanePickerNo: null,
  customerId: null,
  prefix: 'นาย',
  firstName: '',
  lastName: '',
  phoneNumber: '',
  career: '',
  address: {
    address: '',
    moo: '',
    village: '',
    tambol: '',
    amphoe: '',
    province: 'นครราชสีมา',
    postcode: ''
  },
  remark: null,
  searchCustomerId: null,
  searchSaleNo: null,
  deliverDate: undefined,
  deliverTime: null,
  appointmentTime: null,
  arrivalTime: null,
  hasCalled: false,
  sender: null,
  recordedBy: null,
  branchCode: null,
  deliverType: 'customerDelivery'
};

export const renderHeader = () => {
  showLog('render_search_header');
  return (
    <div className="px-3 pt-3 mb-3 border bg-light">
      <label className="text-muted">
        <SearchOutlined /> ค้นหาข้อมูล
      </label>
      <Row>
        <Col md="6">
          <Form.Item name="searchCustomerId" label="🔍  ลูกค้า" className="d-flex flex-row">
            <CustomerSelector size="small" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="searchSaleNo" label="🔍  เลขที่ใบขายสินค้า" className="d-flex flex-row">
            <DocSelector
              collection="sections/sales/vehicles"
              orderBy={['saleNo', 'firstName']}
              labels={['saleNo', 'firstName', 'lastName']}
              size="small"
              className="mx-3"
              hasKeywords
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export const renderInput = values => {
  return (
    <div>
      <div className="border p-3">
        <label className="text-muted">{`ข้อมูลรถ ${values.productCode ? `- ${values.productCode}` : ''}`}</label>
        <Row className="mt-2">
          <Col md="6">
            <Form.Item
              name="productCode"
              rules={[
                {
                  required: true,
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <InputGroup spans={[10, 14]} addonBefore="รุ่นรถ" primary vehicle placeholder="รุ่นรถ" />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="vehicleNo">
              <InputGroup spans={[10, 14]} addonBefore="เลขรถ" placeholder="เลขรถ" />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="engineNo">
              <InputGroup spans={[10, 14]} addonBefore="เลขเครื่อง" placeholder="เลขเครื่อง" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="peripheralNo">
              <InputGroup spans={[10, 14]} addonBefore="หมายเลขอุปกรณ์ต่อพ่วง" placeholder="หมายเลขอุปกรณ์ต่อพ่วง" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="pressureBladeNo">
              <InputGroup spans={[10, 14]} addonBefore="เลขใบดัน" placeholder="เลขใบดัน" />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="bucketNo">
              <InputGroup spans={[10, 14]} addonBefore="หมายเลขบุ้งกี๋" placeholder="หมายเลขบุ้งกี๋" />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="sugarcanePickerNo">
              <InputGroup spans={[10, 14]} addonBefore="หมายเลขคีบอ้อย" placeholder="หมายเลขคีบอ้อย" />
            </Form.Item>
          </Col>
        </Row>
      </div>
      <div className="border p-3">
        <label className="text-muted">{`ข้อมูลลูกค้า ${
          values.firstName ? `- ${values.prefix}${values.firstName} ${values.lastName}` : ''
        }`}</label>
        <div className="mt-2" />
        <Name values={values} phoneNumberRequired />
        <Address address={values.address} />
      </div>
      <div className="border mt-3 p-3 bg-light">
        <label className="text-muted">ข้อมูลการนัดหมาย</label>
        <Row className="mt-2">
          <Col md="6">
            <Form.Item name="branchCode">
              <InputGroup spans={[10, 14]} addonBefore="สาขา" branch />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="sender" rules={getRules(['required'])}>
              <InputGroup
                spans={[10, 14]}
                addonBefore="ผู้ส่ง"
                inputComponent={props => <EmployeeSelector {...props} />}
              />
            </Form.Item>
          </Col>
        </Row>

        <Row>
          <Col md="3">
            <Form.Item
              name="deliverDate"
              rules={[
                {
                  required: true,
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <InputGroup
                spans={[10, 14]}
                addonBefore="วันที่จัดส่ง"
                placeholder="วันที่จัดส่ง"
                inputComponent={props => <DatePicker {...props} />}
                // peripheral
              />
            </Form.Item>
          </Col>
          <Col md="3">
            <Form.Item
              name="deliverTime"
              rules={[
                {
                  required: true,
                  message: 'กรุณาป้อนข้อมูล'
                }
              ]}
            >
              <InputGroup
                spans={[10, 14]}
                addonBefore="เวลาจัดส่ง"
                placeholder="เวลาจัดส่ง"
                inputComponent={props => <DatePicker picker="time" {...props} />}
                // peripheral
              />
            </Form.Item>
          </Col>
          <Col md="3">
            <Form.Item name="arrivalTime">
              <InputGroup
                spans={[10, 14]}
                addonBefore="เวลาถึง"
                placeholder="เวลาถึง"
                inputComponent={props => <DatePicker picker="time" {...props} />}
                // peripheral
              />
            </Form.Item>
          </Col>
          <Col md="3">
            <Form.Item name="appointmentTime">
              <InputGroup
                spans={[10, 14]}
                addonBefore="เวลานัดหมาย"
                placeholder="เวลานัดหมาย"
                inputComponent={props => <DatePicker picker="time" {...props} />}
                // peripheral
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="hasCalled" className="border">
              <InputGroup
                spans={[10, 14]}
                addonBefore="โทรนัดหมาย"
                inputComponent={props => (
                  <Radio.Group className="px-3" {...props}>
                    <Radio value={true}>โทรแล้ว</Radio>
                    <Radio value={false}>ยังไม่โทร</Radio>
                  </Radio.Group>
                )}
              />
            </Form.Item>
          </Col>
          <Col md="6">
            <Form.Item name="recordedBy" rules={getRules(['required'])}>
              <InputGroup
                spans={[10, 14]}
                addonBefore="ผู้แจ้ง"
                inputComponent={props => <EmployeeSelector {...props} />}
              />
            </Form.Item>
          </Col>
        </Row>
        <Row>
          <Col md="6">
            <Form.Item name="remark" label="หมายเหตุ" className="d-flex flex-row">
              <Input placeholder="หมายเหตุ" className="ml-3" />
            </Form.Item>
          </Col>
        </Row>
      </div>
    </div>
  );
};
