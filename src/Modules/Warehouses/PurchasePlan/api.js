import { Form } from 'antd';
import { getRules } from 'api/Table';
import BranchSelector from 'components/BranchSelector';
import PageTitle from 'components/common/PageTitle';
import EmployeeSelector from 'components/EmployeeSelector';
import { DatePicker } from 'elements';
import { Stepper } from 'elements';
import { InputGroup, Input } from 'elements';
import moment from 'moment';
import React from 'react';
import { CardBody, Row, Col } from 'shards-react';

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
    title: 'รหัส',
    dataIndex: 'productCode',
    align: 'center',
    width: 130,
    ellipsis: true
  },
  {
    title: 'รุ่น',
    dataIndex: 'model',
    align: 'center',
    width: 180,
    ellipsis: true
  },
  {
    title: 'ชื่อ',
    dataIndex: 'productName',
    align: 'center',
    width: 260,
    ellipsis: true
  },
  {
    title: 'จำนวน',
    dataIndex: 'qty',
    align: 'center'
  },
  {
    title: 'ผู้แจ้ง',
    dataIndex: 'recordedBy'
  },
  {
    title: 'หมายเหตุ',
    dataIndex: 'remark'
  }
];

export const getDateFromMonth = mnt =>
  moment().format('MM-DD') < `${moment(mnt, 'YYYY-MM').format('MM')}-18`
    ? moment()
    : moment(`${moment(mnt, 'YYYY-MM').format('MM')}-18`, 'MM-DD');

export const getInitialValues = user => ({
  month: moment().format('YYYY-MM'),
  date: getDateFromMonth(moment().format('YYYY-MM')),
  branchCode: user.branch || '0450',
  productType: null,
  productCode: null,
  productName: null,
  qty: 1,
  recordedBy: null,
  remark: null
});

export const renderHeader = ({
  title,
  subtitle,
  steps,
  activeStep,
  branchName,
  dateName,
  disableAllBranches,
  disabled,
  values
}) => {
  return (
    <div className="page-header p-3 ">
      <Row>
        {(title || subtitle) && <PageTitle sm="4" title={title} subtitle={subtitle} className="text-sm-left" />}
        <Col>
          <Stepper
            className="bg-light"
            steps={steps}
            activeStep={activeStep}
            alternativeLabel={false} // In-line labels
          />
        </Col>
      </Row>
      <Row>
        <Col md="4">
          <Form.Item label="สาขา" name={branchName || 'branchCode'}>
            <BranchSelector
              hasAll={!disableAllBranches}
              disabled={disabled}
              style={{ display: 'flex' }}
              // className="my-2"
            />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item label="ประจำเดือน" name={'month'}>
            <DatePicker picker="month" placeholder="เดือน" />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item label="วันที่" name={dateName || 'date'}>
            <DatePicker
              placeholder="วันที่"
              disabledDate={cur => cur && cur > moment(`${values.month}-18`, 'YYYY-MM-DD').endOf('day')}
            />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export const renderInput = values => {
  return (
    <CardBody className="bg-white">
      <Row>
        <Col md="4">
          <Form.Item
            name="productCode"
            rules={[
              {
                required: true,
                message: 'กรุณาป้อนข้อมูล'
              }
            ]}
          >
            <InputGroup spans={[10, 14]} addonBefore="รุ่น" vehicle />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item
            name="productType"
            rules={[
              {
                required: true,
                message: 'กรุณาป้อนข้อมูล'
              }
            ]}
          >
            <InputGroup spans={[10, 14]} addonBefore="ประเภท" readOnly />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="productName">
            <Input placeholder="ชื่อ" readOnly />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="4">
          <Form.Item name="qty" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="จำนวน" center />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="recordedBy" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="บันทึกโดย"
              inputComponent={props => <EmployeeSelector {...props} />}
            />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="remark" label="หมายเหตุ">
            <Input placeholder="หมายเหตุ" />
          </Form.Item>
        </Col>
      </Row>
    </CardBody>
  );
};
