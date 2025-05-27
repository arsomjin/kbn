import React from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Typography, Progress, Statistic } from 'antd';
import { useTranslation } from 'react-i18next';

const { Title, Text } = Typography;

/**
 * UserStats Component
 *
 * Displays user statistics with modern Ant Design components
 * Features responsive design, dark mode support, and i18n translations
 *
 * @param {Object} props - Component props
 * @param {Array} props.smallStats - Array of stat objects with title and value
 * @returns {JSX.Element} The user stats component
 */
const UserStats = ({ smallStats }) => {
  const { t } = useTranslation();

  return (
    <Card
      className="user-stats mb-4 dark:bg-gray-800 dark:border-gray-700"
      bodyStyle={{ padding: '24px' }}
    >
      {/* Statistics Row */}
      <Row gutter={[16, 16]} className="mb-6">
        {smallStats.map((stat, idx) => (
          <Col key={idx} xs={12} sm={6} md={6} lg={6} className="text-center">
            <Statistic
              title={
                <Text
                  type="secondary"
                  className="text-xs uppercase tracking-wide dark:text-gray-400"
                >
                  {t(`userStats.${stat.title.toLowerCase()}`)}
                </Text>
              }
              value={stat.value}
              valueStyle={{
                fontSize: '1.5rem',
                fontWeight: 'bold',
                color: 'var(--ant-color-text)',
              }}
              className="dark:text-gray-200"
            />
          </Col>
        ))}
      </Row>

      {/* Progress Indicators */}
      <div className="border-t border-gray-200 dark:border-gray-600 pt-4">
        <Row gutter={[24, 16]}>
          {/* Workload Progress */}
          <Col xs={24} sm={12} md={12}>
            <div className="mb-2">
              <Text strong className="text-sm dark:text-gray-300">
                {t('userStats.workload')}
              </Text>
            </div>
            <Progress
              percent={80}
              size="small"
              strokeColor="#1890ff"
              trailColor="rgba(0, 0, 0, 0.06)"
              className="mb-1"
              format={(percent) => <Text className="text-xs dark:text-gray-300">{percent}%</Text>}
            />
          </Col>

          {/* Performance Progress */}
          <Col xs={24} sm={12} md={12}>
            <div className="mb-2">
              <Text strong className="text-sm dark:text-gray-300">
                {t('userStats.performance')}
              </Text>
            </div>
            <Progress
              percent={92}
              size="small"
              strokeColor="#52c41a"
              trailColor="rgba(0, 0, 0, 0.06)"
              className="mb-1"
              format={(percent) => <Text className="text-xs dark:text-gray-300">{percent}%</Text>}
            />
          </Col>
        </Row>
      </div>
    </Card>
  );
};

UserStats.propTypes = {
  /**
   * The small stats dataset.
   */
  smallStats: PropTypes.array,
};

UserStats.defaultProps = {
  smallStats: [
    {
      title: 'Tasks',
      value: '1128',
    },
    {
      title: 'Completed',
      value: '72.4%',
    },
    {
      title: 'Projects',
      value: '4',
    },
    {
      title: 'Teams',
      value: '3',
    },
  ],
};

export default UserStats;
