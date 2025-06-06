import { Form, Select } from 'antd';
import { ExpenseType } from 'data/Constant';
import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { Row, Col } from 'shards-react';
import { DatePicker } from 'elements';
const { Option } = Select;

const ExpenseInputHeader = ({
  disabled,
  onBranchChange,
  onDateChange,
  onTypeChange,
  disableAllBranches,
  defaultType,
  defaultDate,
  defaultBranch,
  readOnly
}) => {
  const { branches } = useSelector(state => state.data);
  const [branchCode, setBranch] = useState(defaultBranch || (disableAllBranches ? '0450' : 'all'));
  const [selectedDate, setDate] = useState(defaultDate || new Date());
  const [eType, setType] = useState(defaultType || ExpenseType.dailyChange);

  const _onBranchSelected = br => {
    //  showLog('branchSelected', br);
    setBranch(br);
    onBranchChange(br);
  };

  const _onDateSelected = dateValue => {
    //  showLog('dateValue', dateValue);
    setDate(dateValue);
    onDateChange(dateValue);
  };

  const _onTypeSelect = type => {
    //  showLog('typeSelect', type);
    setType(type);
    onTypeChange(type);
  };

  const selectOptions = disableAllBranches
    ? [
        ...Object.keys(branches).map(key => (
          <Option key={key} value={key}>
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
      <Row form style={{ alignItems: 'center' }}>
        <Col md="4">
          <Form.Item>
            <Select
              placeholder="ประเภทการจ่ายเงิน"
              onChange={ev => _onTypeSelect(ev)}
              defaultValue={eType}
              className="text-primary"
              disabled={readOnly}
            >
              {Object.keys(ExpenseType).map((type, i) => (
                <Option key={i} value={type}>{`จ่ายจาก - ${ExpenseType[type]}`}</Option>
              ))}
            </Select>
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item>
            <Select
              name="branchCode"
              defaultValue={branchCode}
              onChange={ev => _onBranchSelected(ev)}
              disabled={readOnly}
            >
              {selectOptions}
            </Select>
          </Form.Item>
        </Col>
        <Col md="4">
          <Form.Item>
            <DatePicker disabled={readOnly} onChange={_onDateSelected} value={selectedDate} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

export default ExpenseInputHeader;
