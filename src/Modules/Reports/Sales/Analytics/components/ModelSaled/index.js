import React from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody, ListGroup } from 'shards-react';

import colors from 'utils/colors';
import SingleGoal from './SingleGoal';

const ModelInterested = ({ title, data, models }) => (
  <Card small className="go-stats">
    {/* Card Header */}
    <CardHeader className="border-bottom">
      <h6 className="m-0">{title}</h6>
      <div className="block-handle" />
    </CardHeader>

    <CardBody className="py-1" style={{ height: '50vh', overflowY: 'scroll' }}>
      {/* Goals Overview List Group */}
      {data.length === 0 ? (
        <div className="text-center my-4">
          <small className="text-reagent-gray">ไม่มีข้อมูล</small>
        </div>
      ) : (
        <ListGroup flush>
          {data.map((goal, idx) => (
            <SingleGoal key={idx} goal={goal} models={models} />
          ))}
        </ListGroup>
      )}
    </CardBody>
  </Card>
);

ModelInterested.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,
  /**
   * The goals overview data.
   */
  data: PropTypes.array
};

ModelInterested.defaultProps = {
  title: 'Goals Overview',
  data: [
    {
      title: 'Newsletter Signups',
      completions: '291',
      value: '$192.00',
      conversionRate: '57.2%',
      data: {
        datasets: [
          {
            hoverBorderColor: '#fff',
            data: [57.2, 42.8],
            backgroundColor: [colors.primary.toRGBA(0.9), colors.athensGray.toRGBA(0.8)]
          }
        ],
        labels: ['Label 1', 'Label 2']
      }
    },
    {
      title: 'Social Shares',
      completions: '451',
      value: '$0.00',
      conversionRate: '45.5%',
      data: {
        datasets: [
          {
            hoverBorderColor: '#fff',
            data: [45.5, 54.5],
            backgroundColor: [colors.success.toRGBA(0.9), colors.athensGray.toRGBA(0.8)]
          }
        ],
        labels: ['Label 1', 'Label 2']
      }
    },
    {
      title: 'eBook Downloads',
      completions: '12',
      value: '$128.11',
      conversionRate: '5.2%',
      data: {
        datasets: [
          {
            hoverBorderColor: '#fff',
            data: [5.2, 94.8],
            backgroundColor: [colors.salmon.toRGBA(0.9), colors.athensGray.toRGBA(0.8)]
          }
        ],
        labels: ['Label 1', 'Label 2']
      }
    },
    {
      title: 'Account Creations',
      completions: '281',
      value: '$218.12',
      conversionRate: '30.2%',
      data: {
        datasets: [
          {
            hoverBorderColor: '#fff',
            data: [30.2, 69.8],
            backgroundColor: [colors.warning.toRGBA(0.9), colors.athensGray.toRGBA(0.8)]
          }
        ],
        labels: ['Label 1', 'Label 2']
      }
    }
  ]
};

export default ModelInterested;
