import React from 'react';
import PropTypes from 'prop-types';
import { Card, Row, Col, Typography, Avatar, Space, Tag } from 'antd';
import { 
  FacebookOutlined, 
  TwitterOutlined, 
  GithubOutlined, 
  SlackOutlined 
} from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

const { Text, Title } = Typography;

/**
 * UserDetails Component
 * 
 * Displays user profile information including avatar, bio, and social links
 * Features modern Ant Design components with responsive design and dark mode support
 * 
 * @param {Object} props - Component props
 * @param {Object} props.userData - User data object containing profile information
 * @returns {JSX.Element} The user details component
 */
const UserDetails = ({ userData }) => {
  const { t } = useTranslation();

  return (
    <Card 
      className="user-details mb-4 dark:bg-gray-800 dark:border-gray-700"
      cover={
        userData.coverImg && (
          <div className="h-48 overflow-hidden">
            <img 
              src={userData.coverImg} 
              alt={userData.name}
              className="w-full h-full object-cover"
            />
          </div>
        )
      }
    >
      <div className="p-0">
        {/* User Avatar */}
        <div className="flex justify-center -mt-16 mb-4">
          <Avatar 
            size={128}
            src={userData.avatarImg}
            alt={userData.name}
            className="border-4 border-white dark:border-gray-800 shadow-lg"
          >
            {userData.name?.charAt(0)}
          </Avatar>
        </div>
        
        {/* User Name */}
        <Title 
          level={4} 
          className="text-center m-0 mt-2 dark:text-gray-200"
        >
          {userData.name}
        </Title>
        
        {/* User Bio */}
        <Text 
          type="secondary" 
          className="block text-center m-0 mb-4 dark:text-gray-400"
        >
          {userData.bio}
        </Text>
        
        {/* User Social Icons */}
        <div className="flex justify-center mb-4">
          <Space size="middle">
            {userData.social?.facebook && (
              <a 
                href={userData.social.facebook}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300"
              >
                <FacebookOutlined className="text-xl" />
              </a>
            )}
            {userData.social?.twitter && (
              <a 
                href={userData.social.twitter}
                target="_blank"
                rel="noopener noreferrer"
                className="text-blue-400 hover:text-blue-500 dark:text-blue-300 dark:hover:text-blue-200"
              >
                <TwitterOutlined className="text-xl" />
              </a>
            )}
            {userData.social?.github && (
              <a 
                href={userData.social.github}
                target="_blank"
                rel="noopener noreferrer"
                className="text-gray-800 hover:text-gray-900 dark:text-gray-300 dark:hover:text-gray-200"
              >
                <GithubOutlined className="text-xl" />
              </a>
            )}
            {userData.social?.slack && (
              <a 
                href={userData.social.slack}
                target="_blank"
                rel="noopener noreferrer"
                className="text-purple-600 hover:text-purple-700 dark:text-purple-400 dark:hover:text-purple-300"
              >
                <SlackOutlined className="text-xl" />
              </a>
            )}
          </Space>
        
        {/* User Data */}
        <div className="border-t border-b border-gray-200 dark:border-gray-600 p-4">
          <Row gutter={[16, 16]} className="mb-3">
            <Col xs={24} sm={12}>
              <div className="flex flex-col">
                <Text type="secondary" className="text-sm dark:text-gray-400">
                  {t('userProfile.email')}
                </Text>
                <Text className="dark:text-gray-200">
                  {userData.email}
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="flex flex-col">
                <Text type="secondary" className="text-sm dark:text-gray-400">
                  {t('userProfile.location')}
                </Text>
                <Text className="dark:text-gray-200">
                  {userData.location}
                </Text>
              </div>
            </Col>
          </Row>
          <Row gutter={[16, 16]}>
            <Col xs={24} sm={12}>
              <div className="flex flex-col">
                <Text type="secondary" className="text-sm dark:text-gray-400">
                  {t('userProfile.phone')}
                </Text>
                <Text className="dark:text-gray-200">
                  {userData.phone}
                </Text>
              </div>
            </Col>
            <Col xs={24} sm={12}>
              <div className="flex flex-col">
                <Text type="secondary" className="text-sm dark:text-gray-400">
                  {t('userProfile.accountNumber')}
                </Text>
                <Text className="dark:text-gray-200">
                  {userData.accNumber}
                </Text>
              </div>
            </Col>
          </Row>
        </div>
        
        {/* User Tags */}
        <div className="p-4">
          <Space size={[8, 8]} wrap>
            {userData.tags?.map((tag, idx) => (
              <Tag 
                key={idx}
                className="text-xs uppercase dark:bg-gray-700 dark:text-gray-300 dark:border-gray-600"
              >
                {tag}
              </Tag>
            ))}
          </Space>
        </div>
      </div>
    </Card>
  );
};

UserDetails.propTypes = {
  /**
   * The user data.
   */
  userData: PropTypes.object
};

UserDetails.defaultProps = {
  userData: {
    coverImg: require('../../images/user-profile/up-user-details-background.jpg'),
    avatarImg: require('../../images/avatars/0.jpg'),
    name: 'Sierra Brooks',
    bio: "I'm a design focused engineer.",
    email: 'sierra@example.com',
    location: 'Remote',
    phone: '+40 1234 567 890',
    accNumber: '123456789',
    social: {
      facebook: '#',
      twitter: '#',
      github: '#',
      slack: '#'
    },
    tags: ['User Experience', 'UI Design', 'React JS', 'HTML & CSS', 'JavaScript', 'Bootstrap 4']
  }
};

export default UserDetails;
