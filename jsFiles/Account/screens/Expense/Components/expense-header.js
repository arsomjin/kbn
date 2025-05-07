import { Form } from 'antd';
import React from 'react';
import { Row, Col } from 'shards-react';
import { DatePicker } from 'elements';
import BranchSelector from 'components/BranchSelector';
import { getRules } from 'api/Table';
import { useSelector } from 'react-redux';

const ExpenseHeader = ({ disabled }) => {
  const { user } = useSelector((state) => state.auth);

  return (
    <div className="bg-white">
      <Row form style={{ alignItems: 'center' }}>
        <Col md="4">
          <Form.Item
            name="branchCode"
            label="สาขา"
            rules={getRules(['required'])}
          >
            <BranchSelector
              disabled={disabled}
              style={{ minWidth: 180 }}
              onlyUserBranch={user.branch}
            />
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item
            name="date"
            label="วันที่บันทึก"
            rules={getRules(['required'])}
          >
            <DatePicker disabled={disabled} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default ExpenseHeader;
