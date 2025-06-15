import { Form, Row, Col } from 'antd';
import { DatePicker } from 'elements';
import React from 'react';
import PropTypes from 'prop-types';
import BranchSelector from 'components/BranchSelector';
import { getRules } from 'api/Table';

const IncomeDailyHeader = ({ disabled }) => {
  return (
    <div className='bg-white'>
      <Row gutter={16} align='middle'>
        <Col md={12} sm={24}>
          <Form.Item
            name='branchCode'
            label='สาขา'
            rules={getRules(['required'])}
          >
            <BranchSelector disabled={disabled} style={{ minWidth: 180 }} />
          </Form.Item>
        </Col>
        <Col md={12} sm={24}>
          <Form.Item
            name='date'
            label='วันที่บันทึก'
            rules={getRules(['required'])}
          >
            <DatePicker disabled={disabled} style={{ width: '100%' }} />
          </Form.Item>
        </Col>
      </Row>
    </div>
  );
};

IncomeDailyHeader.propTypes = {
  disabled: PropTypes.bool,
};

IncomeDailyHeader.defaultProps = {
  disabled: false,
};

export default IncomeDailyHeader;
