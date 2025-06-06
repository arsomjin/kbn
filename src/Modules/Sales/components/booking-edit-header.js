import { DatePicker } from 'elements';
import React from 'react';
import { Row, Col } from 'shards-react';
import { Form } from 'antd';
import BranchSelector from 'components/BranchSelector';
import DocSelector from 'components/DocSelector';

const BookingEditHeader = ({
  disabled,
  disableAllBranches,
  branchName,
  dateLabel,
  dateName,
  orderSearch,
  onSearchSelect
}) => {
  return (
    <Row form className="page-header pt-3 align-items-center">
      {orderSearch && (
        <Col md="4">
          <Form.Item label={<div className="text-muted">🔍 ค้นหาข้อมูลจากเลขที่ใบจอง/ชื่อลูกค้า</div>} name="refNo">
            <DocSelector
              collection="sections/sales/bookings"
              orderBy={['bookNo', 'firstName']}
              labels={['bookNo', 'firstName', 'lastName']}
              // wheres={[['saleType', '==', 'reservation']]}
              placeholder="พิมพ์เลขที่ใบจอง"
              size={'small'}
              // mode="multiple"
              allowNotInList
              onChange={onSearchSelect}
              hasKeywords
              className="text-muted"
            />
          </Form.Item>
        </Col>
      )}
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
        <Form.Item label={dateLabel || 'วันที่'} name={dateName || 'date'}>
          <DatePicker placeholder={dateLabel || 'วันที่'} />
        </Form.Item>
      </Col>
    </Row>
  );
};

export default BookingEditHeader;
