import React, { useCallback, useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody, Row, Col, ButtonGroup, Button } from 'shards-react';
import moment from 'moment';

import Chart from 'utils/chart';
import { arrayForEach } from 'functions';

const AccountReport = ({ title, onRangeChange, range, chartOptions, chartData, data }) => {
  const legendRef = useRef();
  const canvasRef = useRef();

  const _createChartData = useCallback(
    async dataArr => {
      let labels = [];
      let income = [];
      let expense = [];
      let tax = [];
      await arrayForEach(dataArr, (item, i) => {
        income[i] = item.income;
        expense[i] = item.expense;
        tax[i] = item.tax;

        switch (range) {
          case 'วัน':
            labels[i] = item.x;
            break;
          case 'เดือน':
            labels[i] = moment(item.x, 'MM').format('MMM');
            break;

          default:
            labels[i] = item.x;
            break;
        }
      });
      // await Promise.all([labels, income, expense, tax]);
      return { labels, income, expense, tax };
    },
    [range]
  );

  const _chartUpdate = useCallback(
    async dataArr => {
      const nextData = await _createChartData(dataArr);
      //  showLog('nextData', nextData);
      const chartOption = {
        ...{
          legend: false,
          events: ['click'], // Just to disable mousemove responding.
          // Uncomment the next line in order to disable the animations.
          // animation: false,
          // tooltips: {
          //   enabled: false,
          //   mode: 'index',
          //   position: 'nearest',
          // },
          scales: {
            xAxes: [
              {
                stacked: true,
                gridLines: false
              }
            ],
            yAxes: [
              {
                stacked: true,
                ticks: {
                  userCallback(label) {
                    return label > 999 ? `${(label / 1000).toFixed(0)}k` : label;
                  }
                }
              }
            ]
          }
        },
        ...chartOptions
      };

      const nextChartData = {
        labels: nextData.labels,
        datasets: [
          {
            label: 'รายรับ',
            fill: 'start',
            data: nextData.income,
            backgroundColor: 'rgba(0, 123, 255, 1)',
            borderColor: 'rgba(0, 123, 255, 1)',
            pointBackgroundColor: '#FFFFFF',
            pointHoverBackgroundColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1.5
          },
          {
            label: 'รายจ่าย',
            fill: 'start',
            data: nextData.expense,
            backgroundColor: 'rgba(72, 160, 255, 1)',
            borderColor: 'rgba(72, 160, 255, 1)',
            pointBackgroundColor: '#FFFFFF',
            pointHoverBackgroundColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1.5
          },
          {
            label: 'ภาษี',
            fill: 'start',
            data: nextData.tax,
            backgroundColor: 'rgba(153, 202, 255, 1)',
            borderColor: 'rgba(153, 202, 255, 1)',
            pointBackgroundColor: '#FFFFFF',
            pointHoverBackgroundColor: 'rgba(0, 123, 255, 1)',
            borderWidth: 1.5
          }
        ]
      };

      const AccountReportChart = new Chart(canvasRef.current, {
        type: 'bar',
        data: nextChartData,
        options: chartOption
      });

      // Generate the chart labels.
      legendRef.current.innerHTML = AccountReportChart.generateLegend();

      // Hide initially the first and last chart points.
      // They can still be triggered on hover.
      const meta = AccountReportChart.getDatasetMeta(0);
      meta.data[0]._model.radius = 0;
      meta.data[nextChartData.datasets[0].data.length - 1]._model.radius = 0;

      // Render the chart.
      AccountReportChart.render();
    },
    [_createChartData, chartOptions]
  );

  useEffect(() => {
    //  showLog('nextData', data);
    data.length > 0 && _chartUpdate(data);
  }, [_chartUpdate, data]);

  return (
    <Card small className="h-100">
      <CardHeader className="border-bottom">
        <h6 className="m-0">{title}</h6>
        <div className="block-handle" />
      </CardHeader>

      <CardBody className="pt-0">
        <Row className="border-bottom py-2 bg-light">
          {/* Time Interval */}
          <Col sm="6" className="col d-flex mb-2 mb-sm-0">
            <ButtonGroup>
              {/* <Button theme="white">Hour</Button> */}
              <Button onClick={() => onRangeChange('วัน')} active={range === 'วัน'} theme="white">
                วัน
              </Button>
              <Button onClick={() => onRangeChange('สัปดาห์')} active={range === 'สัปดาห์'} theme="white">
                สัปดาห์
              </Button>
              <Button onClick={() => onRangeChange('เดือน')} active={range === 'เดือน'} theme="white">
                เดือน
              </Button>
              <Button onClick={() => onRangeChange('ปี')} active={range === 'ปี'} theme="white">
                ปี
              </Button>
            </ButtonGroup>
          </Col>

          {/* DatePicker */}
          {/* <Col sm="6" className="col">
          <RangeDatePicker className="justify-content-end" />
        </Col> */}
        </Row>
        <div ref={legendRef} />
        <canvas
          height="120"
          ref={canvasRef}
          style={{ maxWidth: '100% !important' }}
          className="sales-overview-sales-report"
        />
      </CardBody>
    </Card>
  );
};

AccountReport.propTypes = {
  /**
   * The title of the component.
   */
  title: PropTypes.string,
  /**
   * The chart data.
   */
  chartData: PropTypes.object,
  /**
   * The Chart.js options.
   */
  chartOptions: PropTypes.object
};

AccountReport.defaultProps = {
  title: 'Account Report',
  chartData: {
    labels: ['ม.ค.', 'ก.พ.', 'มี.ค.', 'เม.ย.', 'พ.ค.', 'มิ.ย.', 'ก.ค.', 'ส.ค.', 'ก.ย.', 'พ.ย.', 'ธ.ค.'],
    datasets: [
      {
        label: 'รายรับ',
        fill: 'start',
        data: [28922, 25317, 23182, 32119, 11291, 8199, 25182, 22120, 10219, 8771, 12992, 8221],
        backgroundColor: 'rgba(0, 123, 255, 1)',
        borderColor: 'rgba(0, 123, 255, 1)',
        pointBackgroundColor: '#FFFFFF',
        pointHoverBackgroundColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1.5
      },
      {
        label: 'รายจ่าย',
        fill: 'start',
        data: [2892, 2531, 2318, 3211, 1129, 819, 2518, 2212, 1021, 8771, 1299, 820],
        backgroundColor: 'rgba(72, 160, 255, 1)',
        borderColor: 'rgba(72, 160, 255, 1)',
        pointBackgroundColor: '#FFFFFF',
        pointHoverBackgroundColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1.5
      },
      {
        label: 'ภาษี',
        fill: 'start',
        data: [1400, 1250, 1150, 1600, 500, 400, 1250, 1100, 500, 4000, 600, 500],
        backgroundColor: 'rgba(153, 202, 255, 1)',
        borderColor: 'rgba(153, 202, 255, 1)',
        pointBackgroundColor: '#FFFFFF',
        pointHoverBackgroundColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 1.5
      }
    ]
  }
};

export default AccountReport;
