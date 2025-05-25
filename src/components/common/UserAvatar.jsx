import React, { useState } from 'react';
import { Avatar } from 'antd';
import { UserOutlined } from '@ant-design/icons';

const UserAvatar = ({ photoURL, displayName, className, size }) => {
  const [avatarError, setAvatarError] = useState(false);

  return (
    <Avatar
      src={
        !avatarError && photoURL ? (
          <img
            src={photoURL}
            alt={displayName || 'User'}
            referrerPolicy="no-referrer"
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
