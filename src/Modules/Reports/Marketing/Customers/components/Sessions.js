import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody } from 'shards-react';

import colors from 'utils/colors';
import Chart from 'utils/chart';

const Sessions = ({ title, chartData, ...props }) => {
  const legendRef = useRef();
  const canvasRef = useRef();

  useEffect(() => {
    if (chartData?.labels && chartData.labels.length > 0) {
      //  showLog({ max: chartData.datasets[0].data });
      let suggestedMax =
        chartData?.datasets[0] && chartData.datasets[0]?.data && chartData.datasets[0].data.length > 0
          ? Math.max(...chartData.datasets[0].data) + 5
          : 45;
      const chartOptions = {
        ...{
          responsive: true,
          legend: false,
          elements: {
            line: {
              // A higher value makes the line look skewed at this ratio.
              tension: 0.38
            }
          },
          scales: {
            xAxes: [
              {
                gridLines: false,
                ticks: {
                  callback(tick, index) {
                    return index % 2 === 0 ? '' : tick;
                  }
                }
              }
            ],
            yAxes: [
              {
                ticks: {
                  suggestedMax
                }
              }
            ]
          },
          tooltips: {
            enabled: false,
            mode: 'index',
            position: 'nearest'
          }
        },
        ...props.chartOptions
      };

      const AnalyticsOverviewChart = new Chart(canvasRef.current, {
        type: 'line',
        data: chartData,
        options: chartOptions
      });

      // Generate the analytics overview chart labels.
      legendRef.current.innerHTML = AnalyticsOverviewChart.generateLegend();

      // Hide initially the first and last analytics overview chart points.
      // They can still be triggered on hover.
      const meta = AnalyticsOverviewChart.getDatasetMeta(0);
      meta.data[0]._model.radius = 0;
      meta.data[chartData.datasets[0].data.length - 1]._model.radius = 0;

      // Render the chart.
      AnalyticsOverviewChart.render();
    }
  }, [chartData, props.chartOptions]);

  return (
    <Card small className="h-100">
      {/* Card Header */}
      <CardHeader className="border-bottom">
        <h6 className="m-0">{title}</h6>
        <div className="block-handle" />
      </CardHeader>
      <CardBody className="pt-0">
        {!(chartData?.labels && chartData.labels.length > 0) ? (
          <div className="text-center my-4">
            <small className="text-reagent-gray">ไม่มีข้อมูล</small>
          </div>
        ) : (
          <>
            <div ref={legendRef} />
            <canvas
              height="150"
              ref={canvasRef}
              style={{ maxWidth: '100% !important' }}
              className="analytics-overview-sessions"
            />
          </>
        )}
      </CardBody>
    </Card>
  );
};

Sessions.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,
  /**
   * The Chart.js data.
   */
  chartData: PropTypes.object,
  /**
   * The Chart.js config options.
   */
  chartOptions: PropTypes.object
};

Sessions.defaultProps = {
  title: 'Sessions',
  chartData: {
    labels: [
      '09:00 PM',
      '10:00 PM',
      '11:00 PM',
      '12:00 PM',
      '13:00 PM',
      '14:00 PM',
      '15:00 PM',
      '16:00 PM',
      '17:00 PM'
    ],
    datasets: [
      {
        label: 'Today',
        fill: 'start',
        data: [5, 5, 10, 30, 10, 42, 5, 15, 5],
        backgroundColor: colors.primary.toRGBA(0.1),
        borderColor: colors.primary.toRGBA(1),
        pointBackgroundColor: colors.white.toHex(),
        pointHoverBackgroundColor: colors.primary.toRGBA(1),
        borderWidth: 1.5
      },
      {
        label: 'Yesterday',
        fill: 'start',
        data: ['', 23, 5, 10, 5, 5, 30, 2, 10],
        backgroundColor: colors.salmon.toRGBA(0.1),
        borderColor: colors.salmon.toRGBA(1),
        pointBackgroundColor: colors.white.toHex(),
        pointHoverBackgroundColor: colors.salmon.toRGBA(1),
        borderDash: [5, 5],
        borderWidth: 1.5,
        pointRadius: 0,
        pointBorderColor: colors.salmon.toRGBA(1)
      }
    ]
  }
};

export default Sessions;
