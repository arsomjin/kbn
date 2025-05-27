import React, { useEffect, useRef } from 'react';
import PropTypes from 'prop-types';
import { Card, Typography } from 'antd';
import { BarChartOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';
import Chart from '../../utils/chart';

const { Title, Text } = Typography;

/**
 * UserPerformance Component
 *
 * Displays user performance chart with modern Ant Design components
 * Features responsive design, dark mode support, and i18n translations
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The chart title
 * @param {Object} props.chartData - Chart.js data object
 * @param {Object} props.chartOptions - Chart.js options object
 * @returns {JSX.Element} The user performance component
 */
const UserPerformance = ({ title, chartData, chartOptions }) => {
  const { t } = useTranslation();
  const canvasRef = useRef(null);

  useEffect(() => {
    if (!canvasRef.current) return;

    const defaultOptions = {
      responsive: true,
      maintainAspectRatio: false,
      plugins: {
        legend: {
          display: false,
        },
        tooltip: {
          enabled: true,
          mode: 'index',
          position: 'nearest',
          backgroundColor: 'rgba(0, 0, 0, 0.8)',
          titleColor: '#fff',
          bodyColor: '#fff',
          borderColor: '#ddd',
          borderWidth: 1,
        },
      },
      elements: {
        line: {
          tension: 0.2,
        },
        bar: {
          borderRadius: 4,
        },
      },
      scales: {
        x: {
          stacked: true,
          grid: {
            display: false,
          },
          ticks: {
            color: '#6b7280',
          },
        },
        y: {
          beginAtZero: true,
          grid: {
            color: 'rgba(0, 0, 0, 0.1)',
          },
          ticks: {
            color: '#6b7280',
          },
        },
      },
    };

    const chartConfig = {
      type: 'bar',
      data: chartData,
      options: {
        ...defaultOptions,
        ...chartOptions,
      },
    };

    const chartInstance = new Chart(canvasRef.current, chartConfig);

    return () => {
      if (chartInstance) {
        chartInstance.destroy();
      }
    };
  }, [chartData, chartOptions]);

  return (
    <Card
      title={
        <div className="flex items-center gap-2">
          <BarChartOutlined className="text-blue-500" />
          <span className="dark:text-gray-200">{title}</span>
        </div>
      }
      className="mb-4 dark:bg-gray-800 dark:border-gray-700"
      bodyStyle={{ padding: '24px' }}
    >
      <div className="relative" style={{ height: '250px' }}>
        <canvas ref={canvasRef} className="w-full h-full" style={{ maxHeight: '250px' }} />
      </div>

      <div className="mt-4 text-center">
        <Text type="secondary" className="text-sm dark:text-gray-400">
          {t('userPerformance.weeklyOverview')}
        </Text>
      </div>
    </Card>
  );
};

UserPerformance.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,
  /**
   * The chart dataset.
   */
  chartData: PropTypes.object,
  /**
   * The Chart.js options.
   */
  chartOptions: PropTypes.object,
};

UserPerformance.defaultProps = {
  title: 'Weekly Performance Report',
  chartData: {
    labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    datasets: [
      {
        label: 'Hours',
        fill: 'start',
        data: [5, 6.4, 7.2, 6, 9, 4.7, 7],
        backgroundColor: 'rgba(0, 123, 255, 1)',
        borderColor: 'rgba(0, 123, 255, 1)',
        pointBackgroundColor: '#FFFFFF',
        pointHoverBackgroundColor: 'rgba(0, 123, 255, 1)',
        borderWidth: 0,
      },
    ],
  },
};

export default UserPerformance;
