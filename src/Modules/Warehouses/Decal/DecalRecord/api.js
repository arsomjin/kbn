import { Form, Radio } from 'antd';
import { getRules } from 'api/Table';
import EmployeeSelector from 'components/EmployeeSelector';
import HiddenItem from 'components/HiddenItem';
import VehicleNoSelector from 'components/VehicleNoSelector';
import VehicleSelector from 'components/VehicleSelector';
import { Input } from 'elements';
import { ListItem } from 'elements';
import { UploadImage } from 'elements';
import { InputGroup } from 'elements';
import moment from 'moment-timezone';
import React from 'react';
import { Row, Col } from 'shards-react';

export const InitValue = {
  branchCode: null,
  date: moment().format('YYYY-MM-DD'),
  docNo: null,
  productCode: null,
  productPCode: null,
  productName: null,
  vehicleNo: null,
  engineNo: null,
  receivedDate: undefined,
  decalRecordedDate: undefined,
  decalWithdrawDate: undefined,
  recordedBy: null,
  urlChassis: null,
  urlEngine: null,
  isDecal: false,
  isUsed: false,
  isTakeOut: false,
  picker: null,
  remark: null
};

export const getInitialValues = (user, order) => {
  if (order && order.created) {
    return {
      ...InitValue,
      ...order
    };
  }
  let mBranch = order && order.branchCode ? order.branchCode : user.branch || '0450';
  return {
    ...InitValue,
    docId: order?.docId,
    branchCode: mBranch
  };
};

export const renderInput = (values, form) => {
  return (
    <div className="bg-white px-3">
      <HiddenItem name="urlChassis" />
      <HiddenItem name="urlEngine" />
      <HiddenItem name="decalRecordedDate" />
      <HiddenItem name="productPCode" />
      <HiddenItem name="productName" />
      <Row>
        <Col md="6">
          <Form.Item name="docNo" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="เลขที่เอกสาร" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="isUsed">
            <InputGroup
              spans={[10, 14]}
              addonBefore="ประเภทรถ"
              inputComponent={props => (
                <Radio.Group className="px-3" {...props}>
                  <Radio value={false}>ใหม่</Radio>
                  <Radio value={true}>มือสอง</Radio>
                </Radio.Group>
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="productCode" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="รุ่น"
              inputComponent={props => <VehicleSelector {...props} record={values} />}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="vehicleNo" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="เลขตัวถัง"
              inputComponent={props => (
                <VehicleNoSelector
                  {...props}
                  isUsed={values.isUsed}
                  branchCode={values.branchCode}
                  productCode={values.productCode}
                />
              )}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="engineNo" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="เลขเครื่อง" />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="receivedDate" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="วันที่รับ" date />
          </Form.Item>
        </Col>
      </Row>
      <Row form className="my-3">
        <Col md="4" className="text-center">
          <Form.Item name="urlChassis">
            <UploadImage
              storeRef={`images/stocks/decals/chassis`}
              className="bg-light"
              resizeMode="contain"
              width={210}
              height={110}
              title="ลอกลายเลขตัวถัง"
            />
          </Form.Item>
        </Col>
        <Col md="4" className="text-center">
          <Form.Item name="urlEngine">
            <UploadImage
              storeRef={`images/stocks/decals/engine`}
              className="bg-light"
              resizeMode="contain"
              width={210}
              height={110}
              title="ลอกลายเลขเครื่อง"
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="decalRecordedDate" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="วันที่ลอกลาย" date />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="recordedBy" rules={[{ required: true, message: 'กรุณาป้อนข้อมูล' }]}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="ผู้บันทึก"
              inputComponent={props => <EmployeeSelector {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="remark" label="หมายเหตุ">
            <Input />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

const styles = {
  image: {
    objectFit: 'contain',
    width: 210,
    height: 110,
    borderStyle: 'dashed',
    borderWidth: 0.5,
    borderColor: 'lightGrey'
  }
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'เลขที่เอกสาร',
    dataIndex: 'docNo',
    align: 'center'
  },
  {
    title: 'รุ่น',
    dataIndex: 'productCode',
    align: 'center'
  },
  {
    title: 'เลขตัวถัง',
    dataIndex: 'vehicleNo'
  },
  {
    title: 'เลขเครื่อง',
    dataIndex: 'engineNo'
  },
  {
    title: 'วันที่รับ',
    dataIndex: 'receivedDate'
  },
  {
    title: 'ลอกลายแล้ว',
    dataIndex: 'isDecal',
    // render: (txt) => (
    //   <div className={txt ? 'text-success' : 'text-warning'}>
    //     {txt ? <Check /> : <Close />}
    //   </div>
    // ),
    width: 100,
    align: 'center'
  },
  {
    title: 'วันที่ลอกลาย',
    dataIndex: 'decalRecordedDate'
  },
  {
    title: 'ผู้บันทึก',
    dataIndex: 'recordedBy',
    align: 'center'
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark'
  }
];

export const expandedRowRender = record => {
  // showLog({ record });
  return (
    <div className="bg-light bordered pb-1">
      <div className="border py-2">
        {/* <label className="text-primary ml-4">ข้อมูลเพิ่มเติม</label> */}
        <Row>
          <Col md="4">
            <ListItem label="รหัสสินค้า" info={record.productCode} />
            <ListItem label="ชื่อสินค้า" info={record.productName} />
            <ListItem label="เลขตัวถัง" info={record.vehicleNo || '-'} />
            <ListItem label="เลขเครื่อง" info={record.engineNo || '-'} />
          </Col>
          <Col md="8">
            <Row>
              <Col md="4">
                <UploadImage
                  storeRef={`images/stocks/decals/chassis`}
                  className="bg-light"
                  resizeMode="contain"
                  width={210}
                  height={110}
                  readOnly
                  value={record.urlChassis}
                  title="ลอกลายเลขตัวถัง"
                />
              </Col>
              <Col md="4">
                <UploadImage
                  storeRef={`images/stocks/decals/engine`}
                  className="bg-light"
                  resizeMode="contain"
                  width={210}
                  height={110}
                  readOnly
                  value={record.urlEngine}
                  title="ลอกลายเลขเครื่อง"
                />
              </Col>
            </Row>
          </Col>
        </Row>
      </div>
    </div>
  );
};
