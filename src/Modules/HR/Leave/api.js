import { Form } from 'antd';
import { getRules } from 'api/Table';
import CommonSelector from 'components/CommonSelector';
import DepartmentSelector from 'components/DepartmentSelector';
import EmployeeSelector from 'components/EmployeeSelector';
import { Checkbox } from 'elements';
import { InputGroup } from 'elements';
import dayjs from 'dayjs';
import React from 'react';
import { Row, Col, CardBody } from 'shards-react';

export const InitValue = {
  branchCode: null,
  date: dayjs().format('YYYY-MM-DD'),
  employeeId: null,
  department: null,
  position: null,
  leaveType: null,
  reason: null,
  leaveDays: null,
  fromDate: undefined,
  toDate: undefined,
  recordedBy: null,
  approvedBy: null,
  hasMedCer: false
};

export const getInitialValues = user => {
  let mBranch = user.branch || '0450';
  return {
    ...InitValue,
    branchCode: mBranch
  };
};

export const getData = pCode =>
  new Promise(async (r, j) => {
    try {
      r([]);
    } catch (e) {
      j(e);
    }
  });

export const renderInput = ({ POSITIONS, values }) => {
  return (
    <CardBody className="bg-white">
      <Row>
        <Col md="6">
          <Form.Item name="employeeId" rules={getRules(['required'])}>
            <InputGroup
              spans={[8, 16]}
              addonBefore="ชื่อ-นามสกุล"
              inputComponent={props => <EmployeeSelector style={{ width: '100%' }} {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="position" rules={getRules(['required'])}>
            <InputGroup
              spans={[8, 16]}
              addonBefore="ตำแหน่ง"
              inputComponent={props => (
                <CommonSelector
                  size={'small'}
                  placeholder="ตำแหน่ง"
                  optionData={POSITIONS}
                  className="text-primary"
                  {...props}
                />
              )}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="department">
            <InputGroup
              spans={[8, 16]}
              addonBefore="แผนก"
              inputComponent={props => <DepartmentSelector size={'small'} placeholder="แผนก" {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="leaveType" rules={getRules(['required'])}>
            <InputGroup
              spans={[8, 16]}
              addonBefore="ประเภทการลา"
              inputComponent={props => (
                <CommonSelector
                  size={'small'}
                  placeholder="ประเภทการลา"
                  optionData={['ลาป่วย', 'ลากิจ', 'ขาดงาน']}
                  className="text-primary"
                  {...props}
                />
              )}
            />
          </Form.Item>
        </Col>
        {values.leaveType === 'ลาป่วย' && (
          <Col md="4">
            <Form.Item name="hasMedCer">
              <Checkbox>มีใบรับรองแพทย์</Checkbox>
            </Form.Item>
          </Col>
        )}
      </Row>

      <Row>
        <Col md="12">
          <Form.Item name="reason">
            <InputGroup spans={[4, 20]} addonBefore="สาเหตุการลา" />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="4">
          <Form.Item name="leaveDays" rules={getRules(['required'])}>
            <InputGroup spans={[12, 12]} addonBefore="จำนวนวันลา" primary number />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="fromDate" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="จากวันที่" date />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="toDate" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="ถึงวันที่" date />
          </Form.Item>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="recordedBy" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="บันทึกโดย"
              inputComponent={props => <EmployeeSelector placeholder="ผู้บันทึก" {...props} />}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Form.Item name="approvedBy" rules={getRules(['required'])}>
            <InputGroup
              spans={[10, 14]}
              addonBefore="อนุมัติโดย"
              inputComponent={props => <EmployeeSelector placeholder="ผู้อนุมัติ" {...props} />}
            />
          </Form.Item>
        </Col>
      </Row>
    </CardBody>
  );
};

export const columns = [
  {
    title: '#',
    dataIndex: 'id',
    align: 'center'
  },
  {
    title: 'ชื่อ-นามสกุล',
    dataIndex: 'employeeId',
    align: 'center',
    className: 'text-primary'
  },
  {
    title: 'ตำแหน่ง',
    dataIndex: 'position',
    width: 180,
    align: 'center'
  },
  {
    title: 'แผนก',
    dataIndex: 'department',
    align: 'center'
  },
  {
    title: 'ประเภทการลา',
    dataIndex: 'leaveType',
    width: 120,
    align: 'center',
    filters: [
      {
        text: 'ลาป่วย',
        value: 'ลาป่วย'
      },
      {
        text: 'ลากิจ',
        value: 'ลากิจ'
      }
    ],
    onFilter: (value, record) => record.leaveType === value,
    className: 'text-primary'
  },
  {
    title: 'จำนวนวัน',
    dataIndex: 'leaveDays',
    align: 'center',
    width: 100
  },
  {
    title: 'ตั้งแต่วันที่',
    dataIndex: 'fromDate',
    align: 'center',
    width: 120
  },
  {
    title: 'ถึงวันที่',
    dataIndex: 'toDate',
    align: 'center',
    width: 120
  },
  {
    title: 'สาเหตุ',
    dataIndex: 'reason',
    width: 240,
    align: 'center'
  }
];
