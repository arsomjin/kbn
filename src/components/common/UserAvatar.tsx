import React, { useState } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

interface UserAvatarProps {
  photoURL?: string;
  displayName?: string;
  className?: string;
}

const UserAvatar: React.FC<UserAvatarProps> = ({ photoURL, displayName, className }) => {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <Avatar
      src={
        !avatarError && photoURL ? (
          <img
            src={photoURL}
            alt={displayName || 'User'}
            referrerPolicy='no-referrer'
            onError={() => setAvatarError(true)}
          />
        ) : undefined
      }
      icon={!photoURL || avatarError ? <UserOutlined /> : undefined}
      className={className}
      alt={displayName || 'User'}
    />
  );
};

export default UserAvatar;
