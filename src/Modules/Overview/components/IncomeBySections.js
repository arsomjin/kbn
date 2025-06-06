import React, { useEffect, useRef, useState } from 'react';
import PropTypes from 'prop-types';
import { Row, Col, Card, CardHeader, CardBody, CardFooter } from 'shards-react';

import Chart from 'utils/chart';
import { useHistory } from 'react-router-dom';

const IncomeBySections = props => {
  const [data, setData] = useState(props.chartData);

  const history = useHistory();

  const canvasRef = useRef();

  useEffect(() => {
    // showLog({ props });
    setData(props.chartData);
    const chartConfig = {
      type: 'pie',
      data: props.chartData,
      options: {
        ...{
          legend: {
            position: 'bottom',
            labels: {
              padding: 25,
              boxWidth: 20
            }
          },
          cutoutPercentage: 0,
          tooltips: {
            custom: false,
            mode: 'index',
            position: 'nearest'
          }
        },
        ...props.chartOptions
      }
    };

    new Chart(canvasRef.current, chartConfig);
  }, [props, props.chartData, props.chartOptions]);

  return (
    <Card small className="h-100">
      <CardHeader className="border-bottom">
        <h6 className="m-0">{props.title}</h6>
      </CardHeader>
      <CardBody className="d-flex py-0">
        <canvas height="220" ref={canvasRef} className="blog-users-by-device m-auto" />
      </CardBody>
      <CardFooter className="border-top">
        <Row>
          <Col>
            {/* <FormSelect
                size="sm"
                value="last-week"
                style={{ maxWidth: '130px' }}
                onChange={() => {}}
              >
                <option value="last-week">สัปดาห์ก่อน</option>
                <option value="today">วันนี้</option>
                <option value="last-month">เดือนก่อน</option>
                <option value="last-year">ปีก่อน</option>
              </FormSelect> */}
          </Col>
          <Col className="text-right view-report">
            {/* eslint-disable-next-line */}
            <a onClick={() => history.push('/reports/income-summary')} href="#">
              ดูรายงานฉบับเต็ม &rarr;
            </a>
          </Col>
        </Row>
      </CardFooter>
    </Card>
  );
};

IncomeBySections.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,
  /**
   * The chart config object.
   */
  chartConfig: PropTypes.object,
  /**
   * The Chart.js options.
   */
  chartOptions: PropTypes.object,
  /**
   * The chart data.
   */
  chartData: PropTypes.object
};

IncomeBySections.defaultProps = {
  title: 'รายรับแบ่งตามกลุ่ม',
  chartData: {
    datasets: [
      {
        hoverBorderColor: '#ffffff',
        data: [0, 0, 0],
        backgroundColor: ['rgba(0,123,255,0.9)', 'rgba(0,123,255,0.5)', 'rgba(0,123,255,0.3)']
      }
    ],
    labels: ['รถและอุปกรณ์', 'อะไหล่', 'บริการ']
  }
};

export default IncomeBySections;
