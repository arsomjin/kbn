import React from 'react';
import { Spin } from 'antd';
import { LoadingOutlined } from '@ant-design/icons';

interface LoadingScreenProps {
  fullScreen?: boolean;
  overlay?: boolean;
  tip?: string;
}

const LoadingScreen: React.FC<LoadingScreenProps> = ({ fullScreen = true, overlay = false, tip }) => {
  const baseStyles: React.CSSProperties = {
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center'
  };

  const styles: React.CSSProperties = {
    ...baseStyles,
    height: fullScreen ? '100vh' : '100%',
    width: '100%',
    backgroundColor: overlay ? 'rgba(255, 255, 255, 0.85)' : 'transparent',
    position: overlay ? 'fixed' : 'relative',
    top: overlay ? 0 : undefined,
    left: overlay ? 0 : undefined,
    zIndex: overlay ? 1000 : undefined
  };

  return (
    <div style={styles} className='dark:bg-gray-900/85'>
      <Spin indicator={<LoadingOutlined style={{ fontSize: 36 }} spin />} tip={tip} size='large' />
    </div>
  );
};

export default LoadingScreen;
