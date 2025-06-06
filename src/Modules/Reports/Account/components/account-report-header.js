import { Form, Select, Radio } from 'antd';
import React from 'react';
import { useSelector } from 'react-redux';
import { Row, Col } from 'shards-react';
import { DatePicker } from 'elements';
import { formItemClass } from 'data/Constant';
import { isMobile } from 'react-device-detect';
const { Option } = Select;

const AccountReportHeader = ({ values, disabled, disableAllBranches, extraComponent, onlyUserBranch }) => {
  const { branches } = useSelector(state => state.data);
  // const { user } = useSelector((state) => state.auth);

  const selectOptions =
    disableAllBranches || !!onlyUserBranch
      ? [
          ...Object.keys(branches).map(key => (
            <Option
              key={key}
              value={key}
              disabled={
                // !user.isDev &&
                !!onlyUserBranch && onlyUserBranch !== '0450' && onlyUserBranch !== branches[key].branchCode
              }
            >
              {branches[key].branchName}
            </Option>
          ))
        ]
      : [
          <Option key="all" value="all">
            ทุกสาขา
          </Option>,
          ...Object.keys(branches).map(key => (
            <Option key={key} value={key}>
              {branches[key].branchName}
            </Option>
          ))
        ];

  return (
    <div className="px-3 bg-white">
      {/* 
            This className uses Bootstrap/Shards classes:
            - text-center => Center text on all devices by default
            - text-md-left => Override to left alignment on screens ≥768px
          */}
      <Row className="text-center text-md-left">
        <Col md="3">
          <Form.Item name="branchCode">
            <Select disabled={disabled}>{selectOptions}</Select>
          </Form.Item>
        </Col>
        <Col md="3">
          <Form.Item
            label={isMobile ? undefined : 'วันที่:'}
            name="date"
            className={`${formItemClass} d-flex flex-row`}
          >
            <DatePicker placeholder="วันที่" style={{ marginLeft: 10 }} disabled={disabled} />
          </Form.Item>
        </Col>
        {values.branchCode === '0450' && (
          <Col md="4">
            <Form.Item name="excludeParts">
              <Radio.Group buttonStyle="solid" disabled={disabled}>
                <Radio.Button value={1}>รวมอะไหล่</Radio.Button>
                <Radio.Button value={2}>ไม่รวมอะไหล่</Radio.Button>
                <Radio.Button value={3}>เฉพาะอะไหล่</Radio.Button>
              </Radio.Group>
            </Form.Item>
          </Col>
        )}
        {extraComponent && <Col md="2">{extraComponent}</Col>}
      </Row>
    </div>
  );
};

export default AccountReportHeader;
