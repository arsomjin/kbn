import React, { useState } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

export interface UserAvatarProps {
  photoURL?: string;
  displayName?: string;
  className?: string;
  size?: number | 'large' | 'small' | 'default';
}

const UserAvatar: React.FC<UserAvatarProps> = ({ photoURL, displayName, className, size }) => {
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
      size={size}
    />
  );
};

export default UserAvatar;
