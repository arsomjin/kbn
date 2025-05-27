import React from 'react';
import { Card, Upload, Button } from 'antd';
import { CameraOutlined } from '@ant-design/icons';
import { useTranslation } from 'react-i18next';

/**
 * ProfileBackgroundPhoto Component
 *
 * Displays and allows editing of the user's profile background photo
 * Features modern Ant Design Upload component with responsive design and dark mode support
 *
 * @returns {JSX.Element} The profile background photo component
 */
const ProfileBackgroundPhoto = () => {
  const { t } = useTranslation();

  const uploadProps = {
    name: 'background',
    accept: 'image/*',
    showUploadList: false,
    beforeUpload: (file) => {
      // Handle file upload logic here
      console.log('Background photo upload:', file);
      return false; // Prevent automatic upload
    },
  };

  return (
    <div className="relative">
      <div className="h-48 md:h-64 overflow-hidden rounded-t-lg">
        <img
          src="/images/user-profile/up-user-details-background.jpg"
          alt={t('userProfile.backgroundAlt')}
          className="w-full h-full object-cover"
        />
      </div>

      <div className="absolute bottom-4 right-4">
        <Upload {...uploadProps}>
          <Button
            type="primary"
            icon={<CameraOutlined />}
            className="shadow-lg hover:shadow-xl transition-all duration-300 dark:bg-blue-600 dark:border-blue-600 dark:hover:bg-blue-700"
            size="small"
          >
            {t('userProfile.changeBackground')}
          </Button>
        </Upload>
      </div>
    </div>
  );
};

export default ProfileBackgroundPhoto;
