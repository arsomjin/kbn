import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody, ListGroup, ListGroupItem, CardFooter, Row, Col, FormSelect } from 'shards-react';
import NoData from 'components/NoData';
import { useHistory } from 'react-router-dom';

const TopReferrals = ({ title, referralData }) => {
  const history = useHistory();
  return (
    <Card small>
      <CardHeader className="border-bottom">
        <h6 className="m-0">{title}</h6>
        <div className="block-handle" />
      </CardHeader>

      <CardBody className="p-0">
        <ListGroup small flush className="list-group-small">
          {referralData.length > 0 ? (
            referralData.map((item, idx) => (
              <ListGroupItem key={idx} className="d-flex px-3">
                <span className="text-semibold text-fiord-blue">{item.title}</span>
                <span className="ml-auto text-right text-semibold text-reagent-gray">{item.value}</span>
              </ListGroupItem>
            ))
          ) : (
            <NoData />
          )}
        </ListGroup>
      </CardBody>

      <CardFooter className="border-top">
        <Row>
          {/* Time Span */}
          <Col>
            <FormSelect size="sm" value="last-week" style={{ maxWidth: '130px' }} onChange={() => {}}>
              <option value="last-week">สัปดาห์ที่แล้ว</option>
              <option value="today">วันนี้</option>
              <option value="last-month">เดือนก่อน</option>
              <option value="last-year">ปีก่อน</option>
            </FormSelect>
          </Col>

          {/* View Full Report */}
          <Col className="text-right view-report">
            {/* eslint-disable-next-line */}
            <a onClick={() => history.push('/reports/sale-analytics')} href="#">
              รายงานฉบับเต็ม &rarr;
            </a>
          </Col>
        </Row>
      </CardFooter>
    </Card>
  );
};

TopReferrals.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,
  /**
   * The referral data.
   */
  referralData: PropTypes.array
};

TopReferrals.defaultProps = {
  title: 'อันดับสูงสุด',
  referralData: [],
  referralData_bak: [
    {
      title: 'สำนักงานใหญ่',
      value: '0'
    },
    {
      title: 'จักราช',
      value: '0'
    },
    {
      title: 'สีดา',
      value: '0'
    },
    {
      title: 'โคกกรวด',
      value: '0'
    },
    {
      title: 'บัวใหญ่',
      value: '0'
    },
    {
      title: 'หนองบุญมาก',
      value: '0'
    },
    {
      title: 'ขามสะแกแสง',
      value: '0'
    }
  ]
};

export default TopReferrals;
