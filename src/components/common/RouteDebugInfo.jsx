import React, { useState } from 'react';
import { useLocation } from 'react-router-dom';
import { Card, Tag, Space, Typography, Tooltip, Collapse, Button } from 'antd';
import { BugOutlined, UpOutlined, DownOutlined, MinusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import {
  getUserRoutePrefix,
  getUserAccessLayer,
  shouldAllowRouteAccess,
} from '../../utils/roleUtils';
import {
  getRoleDisplayName,
  getProvinceDisplayName,
  getBranchDisplayName,
  getAccessLayerDisplayName,
  getRoleColor,
} from '../../utils/displayUtils';

const { Text } = Typography;

/**
 * Debug component to show current route and layer information
 * Only visible in development mode
 */
const RouteDebugInfo = () => {
  const [isMinimized, setIsMinimized] = useState(true);
  const [activeKey, setActiveKey] = useState(['debug-info']); // Start expanded

  const { userProfile } = useAuth();
  const location = useLocation();
  const { t } = useTranslation(['roles', 'common', 'debug']);

  // Get provinces and branches data from Redux store
  const { provinces, branches } = useSelector((state) => ({
    provinces: state.data?.provinces || {},
    branches: state.data?.branches || {},
  }));

  // Only show in development
  if (import.meta.env.PROD) {
    return null;
  }

  if (!userProfile) {
    return null;
  }

  const userRoutePrefix = getUserRoutePrefix(userProfile);
  const userAccessLayer = getUserAccessLayer(userProfile);
  const hasAccess = shouldAllowRouteAccess(userProfile, location.pathname);

  // Extract province and branch from user profile
  const userProvinceId = userProfile.provinceId || userProfile.province;
  const userBranchCode =
    userProfile?.employeeInfo?.branch || userProfile?.branch || userProfile?.branchCode;

  // If minimized, show only a small icon
  if (isMinimized) {
    return (
      <div
        style={{
          position: 'fixed',
          bottom: 16,
          left: 16,
          zIndex: 1000,
        }}
      >
        <Button
          type="primary"
          shape="circle"
          icon={<BugOutlined />}
          size="large"
          onClick={() => setIsMinimized(false)}
          style={{
            backgroundColor: hasAccess ? '#52c41a' : '#ff4d4f',
            borderColor: hasAccess ? '#52c41a' : '#ff4d4f',
            fontSize: '16px',
            width: 48,
            height: 48,
          }}
          title={t('debug:expandDebug', 'Expand Route Debug')}
        />
      </div>
    );
  }

  const debugContent = (
    <Space direction="vertical" size="small" style={{ width: '100%' }}>
      {/* Current Path */}
      <div>
        <Text strong>{t('debug:currentPath', 'Current Path')}:</Text>
        <br />
        <Text
          code
          copyable={{
            text: location.pathname,
            tooltips: [t('debug:copyPath', 'Copy path'), t('debug:copied', 'Copied!')],
          }}
          style={{ fontSize: '11px', wordBreak: 'break-all' }}
        >
          {location.pathname}
        </Text>
      </div>

      {/* User Role */}
      <div>
        <Text strong>{t('debug:userRole', 'User Role')}:</Text>
        <br />
        <Tooltip title={t(`${userProfile.role}.description`, '')}>
          <Tag color={getRoleColor(userProfile.role)} style={{ fontSize: '11px' }}>
            {getRoleDisplayName(userProfile.role, t)}
          </Tag>
        </Tooltip>
      </div>

      {/* Access Layer */}
      <div>
        <Text strong>{t('debug:accessLayer', 'Access Layer')}:</Text>
        <br />
        <Tag color="green" style={{ fontSize: '11px' }}>
          {getAccessLayerDisplayName(userAccessLayer, t)}
        </Tag>
      </div>

      {/* Route Prefix */}
      <div>
        <Text strong>{t('debug:routePrefix', 'Route Prefix')}:</Text>
        <br />
        <Text
          code
          copyable={{
            text: userRoutePrefix,
            tooltips: [t('debug:copyPrefix', 'Copy prefix'), t('debug:copied', 'Copied!')],
          }}
          style={{ fontSize: '11px' }}
        >
          {userRoutePrefix}
        </Text>
      </div>

      {/* Access Status */}
      <div>
        <Text strong>{t('debug:accessAllowed', 'Access Allowed')}:</Text>
        <br />
        <Tag color={hasAccess ? 'success' : 'error'} style={{ fontSize: '11px' }}>
          {hasAccess ? t('debug:yes', 'Yes') : t('debug:no', 'No')}
        </Tag>
      </div>

      {/* Province Information */}
      {userProvinceId && (
        <div>
          <Text strong>{t('debug:province', 'Province')}:</Text>
          <br />
          <Tooltip title={`${t('debug:provinceId', 'Province ID')}: ${userProvinceId}`}>
            <Tag color="purple" style={{ fontSize: '11px' }}>
              {getProvinceDisplayName(userProvinceId, provinces, t)}
            </Tag>
          </Tooltip>
        </div>
      )}

      {/* Branch Information */}
      {userBranchCode && (
        <div>
          <Text strong>{t('debug:branch', 'Branch')}:</Text>
          <br />
          <Tooltip title={`${t('debug:branchCode', 'Branch Code')}: ${userBranchCode}`}>
            <Tag color="orange" style={{ fontSize: '11px' }}>
              {getBranchDisplayName(userBranchCode, branches, userProvinceId, t)}
            </Tag>
          </Tooltip>
        </div>
      )}

      {/* Additional User Info */}
      {userProfile.displayName && (
        <div>
          <Text strong>{t('debug:displayName', 'Display Name')}:</Text>
          <br />
          <Text style={{ fontSize: '11px' }}>{userProfile.displayName}</Text>
        </div>
      )}

      {/* Environment Info */}
      <div>
        <Text strong>{t('debug:environment', 'Environment')}:</Text>
        <br />
        <Tag color={import.meta.env.DEV ? 'warning' : 'default'} style={{ fontSize: '10px' }}>
          {import.meta.env.MODE}
        </Tag>
      </div>
    </Space>
  );

  const collapseItems = [
    {
      key: 'debug-info',
      label: (
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <BugOutlined style={{ fontSize: '14px' }} />
            <span style={{ fontSize: '14px', fontWeight: 'bold' }}>
              {t('debug:title', 'Route Debug')}
            </span>
            <Tag color={hasAccess ? 'success' : 'error'} style={{ fontSize: '10px', margin: 0 }}>
              {hasAccess ? '✓' : '✗'}
            </Tag>
          </div>
        </div>
      ),
      children: debugContent,
    },
  ];

  return (
    <Card
      size="small"
      style={{
        position: 'fixed',
        bottom: 16,
        left: 16,
        zIndex: 1000,
        maxWidth: 320,
        fontSize: '12px',
        opacity: 0.95,
      }}
      bodyStyle={{ padding: 0 }}
      extra={
        <Button
          type="text"
          size="small"
          icon={<MinusOutlined />}
          onClick={() => setIsMinimized(true)}
          style={{ fontSize: '12px' }}
          title={t('debug:minimize', 'Minimize')}
        />
      }
    >
      <Collapse
        size="small"
        activeKey={activeKey}
        onChange={setActiveKey}
        items={collapseItems}
        expandIcon={({ isActive }) =>
          isActive ? (
            <UpOutlined style={{ fontSize: '12px' }} />
          ) : (
            <DownOutlined style={{ fontSize: '12px' }} />
          )
        }
        style={{
          backgroundColor: 'transparent',
          border: 'none',
        }}
        ghost
      />
    </Card>
  );
};

export default RouteDebugInfo;
