import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody, ListGroup, ListGroupItem } from 'shards-react';
import { useSelector } from 'react-redux';

const TopReferrals = ({ title, referralData }) => {
  const { users } = useSelector(state => state.data);

  return (
    <Card small style={{ height: '60vh' }}>
      <CardHeader className="border-bottom">
        <h6 className="m-0">{title}</h6>
        <div className="block-handle" />
      </CardHeader>

      <CardBody className="p-1" style={{ overflowY: 'scroll' }}>
        {referralData.length === 0 ? (
          <div className="text-center my-4">
            <small className="text-reagent-gray">ไม่มีข้อมูล</small>
          </div>
        ) : (
          <ListGroup small flush className="list-group-small">
            {/* <ListGroupItem className="d-flex px-3 border-bottom">
              <span className="text-semibold text-fiord-blue">ชื่อ</span>
              <span className="ml-auto text-right text-semibold text-fiord-blue">
                จำนวนลูกค้า
              </span>
            </ListGroupItem> */}
            {referralData
              // .filter((l) => l.inputBy || l.agent)
              .slice(0, 10)
              .map((item, idx) => (
                <ListGroupItem key={idx} className="d-flex px-3">
                  <span className="text-semibold text-fiord-blue">
                    {item.agent || (users[item.inputBy] ? users[item.inputBy].displayName : 'ไม่ระบุ')}
                  </span>
                  <span className="ml-auto text-right text-semibold text-reagent-gray">{item.counter}</span>
                </ListGroupItem>
              ))}
          </ListGroup>
        )}
      </CardBody>
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
  title: 'Top Referrals',
  referralData: [
    {
      title: 'GitHub',
      value: '19,291'
    },
    {
      title: 'Stack Overflow',
      value: '11,201'
    },
    {
      title: 'Hacker News',
      value: '9,291'
    },
    {
      title: 'Reddit',
      value: '8,281'
    },
    {
      title: 'The Next Web',
      value: '7,128'
    },
    {
      title: 'Tech Crunch',
      value: '6,218'
    },
    {
      title: 'YouTube',
      value: '1,218'
    },
    {
      title: 'Adobe',
      value: '1,171'
    }
  ]
};

export default TopReferrals;
