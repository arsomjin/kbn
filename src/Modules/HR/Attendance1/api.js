import { Form } from 'antd';
import { getRules } from 'api/Table';
import CommonSelector from 'components/CommonSelector';
import DepartmentSelector from 'components/DepartmentSelector';
import EmployeeSelector from 'components/EmployeeSelector';
import { InputGroup } from 'elements';
import React from 'react';
import { CardBody, Row, Col } from 'shards-react';

export const renderInput = ({ POSITIONS }) => {
  return (
    <CardBody className="bg-white">
      <Row>
        <Col md="6">
          <Form.Item name="employeeId" rules={getRules(['required'])}>
            <InputGroup
              spans={[8, 16]}
              addonBefore="พนักงาน"
              alignRight
              inputComponent={props => <EmployeeSelector style={{ width: '100%' }} {...props} />}
            />
          </Form.Item>
        </Col>
        <Col md="6">
          <Row>
            <Col md="8">
              <Form.Item name="position" rules={getRules(['required'])}>
                <InputGroup
                  spans={[8, 16]}
                  addonBefore="ตำแหน่ง"
                  alignRight
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
            <Col md="4">
              <Form.Item name="department" rules={getRules(['required'])}>
                <InputGroup
                  spans={[8, 16]}
                  addonBefore="แผนก"
                  inputComponent={props => <DepartmentSelector size={'small'} placeholder="แผนก" {...props} />}
                />
              </Form.Item>
            </Col>
          </Row>
        </Col>
      </Row>
      <Row>
        <Col md="6">
          <Form.Item name="leaveType" rules={getRules(['required'])}>
            <InputGroup
              spans={[8, 16]}
              addonBefore="ประเภทการลา"
              alignRight
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
      </Row>

      <Row>
        <Col md="12">
          <Form.Item name="reason" rules={getRules(['required'])}>
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
            <InputGroup spans={[10, 14]} addonBefore="จากวันที่" alignRight date />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item name="toDate" rules={getRules(['required'])}>
            <InputGroup spans={[10, 14]} addonBefore="ถึงวันที่" alignRight date />
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
    title: 'เลขทะเบียนรถ',
    dataIndex: 'vehicleRegNumber',
    align: 'center'
  },
  {
    title: 'ค่าน้ำมัน',
    dataIndex: 'gasCost'
  },
  {
    title: 'ระยะทาง (ก.ม.)',
    dataIndex: 'distance',
    editable: true
  },
  {
    title: 'ต้นทาง',
    dataIndex: 'origin'
  },
  {
    title: 'ปลายทาง',
    dataIndex: 'destination'
  }
];
