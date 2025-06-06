import { DatePicker } from 'elements';
import React from 'react';
import { Row, Col } from 'shards-react';
import { Form } from 'antd';
import BranchSelector from 'components/BranchSelector';
import DocSelector from 'components/DocSelector';
import Text from 'antd/lib/typography/Text';

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
          <Form.Item
            label={
              <div className="text-muted">
                <span role="img" aria-label="search">
                  🔍
                  <Text className="ml-2">ค้นหาข้อมูลจากเลขที่ใบสั่งขาย / ชื่อลูกค้า</Text>
                </span>
              </div>
            }
            name="refNo"
          >
            <DocSelector
              collection="sections/sales/vehicles"
              orderBy={['saleNo', 'firstName']}
              labels={['saleNo', 'firstName', 'lastName']}
              // wheres={[['saleType', '==', 'reservation']]}
              placeholder="พิมพ์เลขที่ใบสั่งขาย"
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
