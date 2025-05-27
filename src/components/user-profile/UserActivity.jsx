import React from 'react';
import PropTypes from 'prop-types';
import { Card, Button, Tag, Checkbox, Space, Typography, Timeline } from 'antd';
import {
  ProjectOutlined,
  CheckCircleOutlined,
  WarningOutlined,
  ClockCircleOutlined,
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Text, Link } = Typography;

/**
 * UserActivity Component
 *
 * Displays user activity timeline with modern Ant Design components
 * Features responsive design, dark mode support, and i18n translations
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The activity section title
 * @returns {JSX.Element} The user activity component
 */
const UserActivity = ({ title }) => {
  const { t } = useTranslation();

  const timelineItems = [
    {
      dot: <ProjectOutlined className="text-blue-500" />,
      children: (
        <div className="pb-4">
          <Text type="secondary" className="text-sm dark:text-gray-400">
            {t('userActivity.timeAgo.minutes', { minutes: 23 })}
          </Text>
          <div className="mt-1">
            <Text className="dark:text-gray-200">
              {t('userActivity.assigned')} <Link href="#">Shards Dashboards</Link>{' '}
              {t('userActivity.project')}.
            </Text>
          </div>
          <div className="mt-2">
            <Button size="small" type="default">
              {t('userActivity.viewProject')}
            </Button>
          </div>
        </div>
      ),
    },
    {
      dot: <CheckCircleOutlined className="text-green-500" />,
      children: (
        <div className="pb-4">
          <Text type="secondary" className="text-sm dark:text-gray-400">
            {t('userActivity.timeAgo.hours', { hours: 2 })}
          </Text>
          <div className="mt-1">
            <Text className="dark:text-gray-200">
              {t('userActivity.marked')} <Link href="#">7 {t('userActivity.tasks')}</Link>{' '}
              {t('userActivity.as')} <Tag color="success">{t('userActivity.complete')}</Tag>{' '}
              {t('userActivity.inside')} <Link href="#">DesignRevision</Link>{' '}
              {t('userActivity.project')}.
            </Text>
          </div>
        </div>
      ),
    },
    {
      dot: <ProjectOutlined className="text-blue-500" />,
      children: (
        <div className="pb-4">
          <Text type="secondary" className="text-sm dark:text-gray-400">
            {t('userActivity.timeAgo.hoursMinutes', { hours: 3, minutes: 10 })}
          </Text>
          <div className="mt-1">
            <Text className="dark:text-gray-200">
              {t('userActivity.added')} <Link href="#">Jack Nicholson</Link> {t('userActivity.and')}{' '}
              <Link href="#">3 {t('userActivity.others')}</Link> {t('userActivity.toThe')}{' '}
              <Link href="#">DesignRevision</Link> {t('userActivity.team')}.
            </Text>
          </div>
          <div className="mt-2">
            <Button size="small" type="default">
              {t('userActivity.viewTeam')}
            </Button>
          </div>
        </div>
      ),
    },
    {
      dot: <WarningOutlined className="text-orange-500" />,
      children: (
        <div className="pb-4">
          <Text type="secondary" className="text-sm dark:text-gray-400">
            {t('userActivity.timeAgo.days', { days: 2 })}
          </Text>
          <div className="mt-1">
            <Text className="dark:text-gray-200">
              {t('userActivity.opened')} <Link href="#">3 {t('userActivity.issues')}</Link>{' '}
              {t('userActivity.in')} <Link href="#">2 {t('userActivity.projects')}</Link>.
            </Text>
          </div>
        </div>
      ),
    },
    {
      dot: <ClockCircleOutlined className="text-purple-500" />,
      children: (
        <div className="pb-4">
          <Text type="secondary" className="text-sm dark:text-gray-400">
            {t('userActivity.timeAgo.days', { days: 2 })}
          </Text>
          <div className="mt-1">
            <Text className="dark:text-gray-200">
              {t('userActivity.added')} <Link href="#">3 {t('userActivity.newTasks')}</Link>{' '}
              {t('userActivity.toThe')} <Link href="#">DesignRevision</Link>{' '}
              {t('userActivity.project')}:
            </Text>
            <div className="mt-2">
              <Space direction="vertical" size="small" className="w-full">
                <Checkbox>
                  <Text className="dark:text-gray-200">
                    {t('userActivity.tasks.fixPagination')}
                  </Text>
                </Checkbox>
                <Checkbox>
                  <Text className="dark:text-gray-200">
                    {t('userActivity.tasks.removePadding')}
                  </Text>
                </Checkbox>
              </Space>
            </div>
          </div>
        </div>
      ),
    },
    {
      dot: <WarningOutlined className="text-red-500" />,
      children: (
        <div className="pb-4">
          <Text type="secondary" className="text-sm dark:text-gray-400">
            {t('userActivity.timeAgo.days', { days: 2 })}
          </Text>
          <div className="mt-1">
            <Text className="dark:text-gray-200">
              {t('userActivity.marked')} <Link href="#">3 {t('userActivity.tasks')}</Link>{' '}
              {t('userActivity.as')} <Tag color="error">{t('userActivity.invalid')}</Tag>{' '}
              {t('userActivity.inside')} <Link href="#">Shards Dashboards</Link>{' '}
              {t('userActivity.project')}.
            </Text>
          </div>
        </div>
      ),
    },
  ];

  return (
    <Card
      title={title}
      className="user-activity mb-4 dark:bg-gray-800 dark:border-gray-700"
      bodyStyle={{ padding: '16px 24px' }}
      extra={
        <Button type="link" size="small" className="dark:text-blue-400">
          {t('userActivity.viewAll')}
        </Button>
      }
    >
      <Timeline items={timelineItems} className="dark:text-gray-200" />

      <div className="text-center pt-4 border-t border-gray-200 dark:border-gray-600">
        <Button type="default" size="small">
          {t('userActivity.loadMore')}
        </Button>
      </div>
    </Card>
  );
};

UserActivity.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,
};

UserActivity.defaultProps = {
  title: 'User Activity',
};

export default UserActivity;
