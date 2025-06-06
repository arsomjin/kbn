import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, CardHeader, CardBody } from 'shards-react';

import colors from 'utils/colors';
import Chart from 'utils/chart';
import NoData from 'components/NoData';

const CustomersByBranch = ({ title, chartData, chartOptions }) => {
  const canvasRef = useRef();

  useEffect(() => {
    const chartConfig = {
      type: 'doughnut',
      options: {
        ...{
          legend: false,
          cutoutPercentage: 80,
          tooltips: {
            enabled: false,
            mode: 'index',
            position: 'nearest'
          }
        },
        ...chartOptions
      },
      data: chartData
    };

    new Chart(canvasRef.current, chartConfig);
  }, [chartData, chartOptions]);

  const getParsedLabels = () => {
    if (!chartData || typeof chartData.labels === 'undefined') {
      return [];
    }

    return chartData.labels.map((label, idx) => {
      const dataset = chartData.datasets[0];

      return {
        title: label,
        icon: dataset.icons[idx],
        iconColor: dataset.backgroundColor[idx],
        value: dataset.data[idx]
      };
    });
  };

  const labels = getParsedLabels();

  return (
    <Card small className="ubd-stats h-100">
      <CardHeader className="border-bottom">
        <h6 className="m-0">{title}</h6>
        <div className="block-handle" />
      </CardHeader>

      <CardBody className="d-flex flex-column">
        {/* Chart */}
        {(!labels || labels.length === 0) && <NoData />}
        <canvas width="100" ref={canvasRef} className="analytics-users-by-device mt-3 mb-4" />

        {/* Legend */}
        <div className={`ubd-stats__legend w-75 m-auto p-1 pb-${labels.length <= 3 ? 4 : 1}`}>
          {labels.slice(0, 3).map((label, idx) => (
            <div key={idx} className="ubd-stats__item">
              {label.icon && (
                <div dangerouslySetInnerHTML={{ __html: label.icon }} style={{ color: label.iconColor }} />
              )}
              <span className="ubd-stats__category" style={{ whiteSpace: 'nowrap' }}>
                {label.title}
              </span>
              <span className="ubd-stats__value">{label.value}%</span>
            </div>
          ))}
        </div>
        {labels.length > 3 && (
          <div className={`ubd-stats__legend w-75 m-auto p-1 pb-${labels.length <= 6 ? 4 : 1}`}>
            {labels.slice(3).map((label, idx) => (
              <div key={idx} className="ubd-stats__item">
                {label.icon && (
                  <div dangerouslySetInnerHTML={{ __html: label.icon }} style={{ color: label.iconColor }} />
                )}
                <span className="ubd-stats__category">{label.title}</span>
                <span className="ubd-stats__value">{label.value}%</span>
              </div>
            ))}
          </div>
        )}
        {labels.length > 6 && (
          <div className="ubd-stats__legend w-75 m-auto p-1 pb-4">
            {labels.slice(6).map((label, idx) => (
              <div key={idx} className="ubd-stats__item">
                {label.icon && (
                  <div dangerouslySetInnerHTML={{ __html: label.icon }} style={{ color: label.iconColor }} />
                )}
                <span className="ubd-stats__category">{label.title}</span>
                <span className="ubd-stats__value">{label.value}%</span>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

CustomersByBranch.propTypes = {
  /**
   * The card's title.
   */
  title: PropTypes.string,
  /**
   * The Chart.js options.
   */
  chartOptions: PropTypes.object,
  /**
   * The chart data.
   */
  chartData: PropTypes.object,
  /**
   * The Chart.js config.
   */
  chartConfig: PropTypes.object
};

CustomersByBranch.defaultProps = {
  title: 'Users by Device',
  chartConfig: Object.create(null),
  chartOptions: Object.create(null),
  chartData: {
    labels: ['Desktop', 'Tablet', 'Mobile'],
    datasets: [
      {
        hoverBorderColor: colors.white.toRGBA(1),
        data: [68.3, 24.2, 7.5],
        icons: [
          '<i class="material-icons">&#xE30B;</i>',
          '<i class="material-icons">&#xE32F;</i>',
          '<i class="material-icons">&#xE325;</i>'
        ],
        backgroundColor: [colors.primary.toRGBA(0.9), colors.primary.toRGBA(0.5), colors.primary.toRGBA(0.3)]
      }
    ]
  }
};

export default CustomersByBranch;
