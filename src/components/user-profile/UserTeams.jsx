import React from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Avatar, Typography, Space } from 'antd';
import { TeamOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

/**
 * UserTeams Component
 *
 * Displays user teams with modern Ant Design components
 * Features responsive design, dark mode support, and i18n translations
 *
 * @param {Object} props - Component props
 * @param {string} props.title - The teams section title
 * @param {Array} props.teams - Array of team objects
 * @returns {JSX.Element} The user teams component
 */
const UserTeams = ({ title, teams }) => {
  const { t } = useTranslation();

  return (
    <Card
      title={title}
      className="user-teams mb-4 dark:bg-gray-800 dark:border-gray-700"
      bodyStyle={{ padding: '0' }}
    >
      <div className="divide-y divide-gray-200 dark:divide-gray-600">
        {teams.map((team, idx) => (
          <div
            key={idx}
            className="p-4 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors duration-200"
          >
            <Row gutter={[12, 12]} align="middle">
              <Col flex="none">
                <Avatar
                  size={48}
                  src={team.image}
                  icon={<TeamOutlined />}
                  className="border-2 border-white dark:border-gray-600 shadow-sm"
                >
                  {team.name?.charAt(0)}
                </Avatar>
              </Col>
              <Col flex="auto">
                <div className="flex flex-col">
                  <Title level={5} className="m-0 dark:text-gray-200">
                    {team.name}
                  </Title>
                  <Text type="secondary" className="text-sm dark:text-gray-400">
                    {team.members}
                  </Text>
                </div>
              </Col>
              <Col flex="none">
                <Space>
                  <Text type="secondary" className="text-xs dark:text-gray-500">
                    {t('userTeams.active')}
                  </Text>
                </Space>
              </Col>
            </Row>
          </div>
        ))}
      </div>

      {teams.length === 0 && (
        <div className="text-center py-8">
          <TeamOutlined className="text-4xl text-gray-400 dark:text-gray-600 mb-2" />
          <Text type="secondary" className="dark:text-gray-400">
            {t('userTeams.noTeams')}
          </Text>
        </div>
      )}
    </Card>
  );
};

UserTeams.propTypes = {
  /**
   * The component's title.
   */
  title: PropTypes.string,
  /**
   * The teams dataset.
   */
  teams: PropTypes.array,
};

UserTeams.defaultProps = {
  title: 'Teams',
  teams: [
    {
      image: '/images/user-profile/team-thumb-1.png',
      name: 'Team Edison',
      members: '21 Members',
    },
    {
      image: '/images/user-profile/team-thumb-2.png',
      name: 'Team Shelby',
      members: '21 Members',
    },
    {
      image: '/images/user-profile/team-thumb-3.png',
      name: 'Team Dante',
      members: '21 Members',
    },
  ],
};

export default UserTeams;
