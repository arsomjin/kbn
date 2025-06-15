/**
 * Permission-Aware Button Component
 *
 * A button that automatically checks permissions and shows appropriate
 * warning messages when users don't have access to perform actions.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Button, Tooltip } from 'antd';
import { LockOutlined, ExclamationCircleOutlined } from '@ant-design/icons';

import { usePermissions } from '../hooks/usePermissions';
import { showPermissionWarning } from '../utils/permissionWarnings';

/**
 * Permission-aware button component
 * @param {Object} props
 * @param {string} props.permission - Required permission to enable button
 * @param {Array} props.anyOf - Array of permissions (user needs any one)
 * @param {Array} props.allOf - Array of permissions (user needs all)
 * @param {string} props.authority - Required authority level
 * @param {string} props.department - Required department access
 * @param {Object} props.geographic - Geographic context for permission check
 * @param {Function} props.onClick - Click handler (only called if permission granted)
 * @param {string} props.warningType - Type of warning message to show
 * @param {string} props.warningMessage - Custom warning message
 * @param {boolean} props.showTooltip - Show tooltip explaining why button is disabled
 * @param {boolean} props.hideWhenDenied - Hide button completely when access denied
 * @param {React.ReactNode} props.children - Button content
 * @param {Object} props.buttonProps - Additional props to pass to Button component
 */
const PermissionButton = ({
  permission,
  anyOf,
  allOf,
  authority,
  department,
  geographic = {},
  onClick,
  warningType = 'NO_PERMISSION',
  warningMessage,
  showTooltip = true,
  hideWhenDenied = false,
  children,
  disabled = false,
  loading = false,
  type = 'default',
  size = 'medium',
  icon,
  className = '',
  style = {},
  ...buttonProps
}) => {
  const {
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    hasAuthorityLevel,
    worksInDepartment,
    isActive,
    userRBAC,
  } = usePermissions();

  // Check if user has required permissions
  const checkPermissions = () => {
    // DEV users bypass all checks
    if (userRBAC?.isDev) return true;

    // Check if user is active
    if (!isActive) return false;

    // Check authority level
    if (authority && !hasAuthorityLevel(authority)) return false;

    // Check department access
    if (department && !worksInDepartment(department)) return false;

    // Check specific permission
    if (permission && !hasPermission(permission, geographic)) return false;

    // Check any of permissions
    if (anyOf && !hasAnyPermission(anyOf, geographic)) return false;

    // Check all of permissions
    if (allOf && !hasAllPermissions(allOf, geographic)) return false;

    return true;
  };

  const hasAccess = checkPermissions();

  // Handle click with permission check
  const handleClick = (e) => {
    if (!hasAccess) {
      e.preventDefault();
      e.stopPropagation();

      // Show appropriate warning message
      if (warningMessage) {
        showPermissionWarning('NO_PERMISSION', {
          customMessage: {
            title: 'ไม่มีสิทธิ์เข้าถึง',
            description: warningMessage,
          },
        });
      } else {
        showPermissionWarning(warningType, {
          context: getContextMessage(),
        });
      }

      return;
    }

    // Call original onClick if permission granted
    if (onClick) {
      onClick(e);
    }
  };

  // Get context message based on permission type
  const getContextMessage = () => {
    if (authority) {
      return `ต้องการสิทธิ์ระดับ ${authority}`;
    }

    if (department) {
      return `ต้องการสิทธิ์เข้าถึงแผนก ${department}`;
    }

    if (permission) {
      return `ต้องการสิทธิ์ ${permission}`;
    }

    return 'คุณไม่มีสิทธิ์ในการดำเนินการนี้';
  };

  // Get tooltip message for disabled button
  const getTooltipMessage = () => {
    if (!isActive) {
      return 'บัญชีของคุณไม่ได้ใช้งาน';
    }

    return getContextMessage();
  };

  // Hide button if access denied and hideWhenDenied is true
  if (!hasAccess && hideWhenDenied) {
    return null;
  }

  // Determine button state
  const isDisabled = disabled || loading || !hasAccess;
  const buttonIcon = !hasAccess ? <LockOutlined /> : icon;
  const buttonType = !hasAccess ? 'default' : type;

  // Button component
  const button = (
    <Button
      {...buttonProps}
      type={buttonType}
      size={size}
      icon={buttonIcon}
      disabled={isDisabled}
      loading={loading}
      onClick={handleClick}
      className={`${className} ${!hasAccess ? 'permission-denied' : ''}`.trim()}
      style={{
        ...style,
        ...(!hasAccess && {
          opacity: 0.6,
          cursor: 'not-allowed',
        }),
      }}
    >
      {children}
    </Button>
  );

  // Wrap with tooltip if access denied and showTooltip is true
  if (!hasAccess && showTooltip) {
    return (
      <Tooltip
        title={getTooltipMessage()}
        placement='top'
        overlayStyle={{
          fontFamily: 'var(--nature-font-family)',
        }}
      >
        {button}
      </Tooltip>
    );
  }

  return button;
};

PermissionButton.propTypes = {
  permission: PropTypes.string,
  anyOf: PropTypes.arrayOf(PropTypes.string),
  allOf: PropTypes.arrayOf(PropTypes.string),
  authority: PropTypes.string,
  department: PropTypes.string,
  geographic: PropTypes.object,
  onClick: PropTypes.func,
  warningType: PropTypes.string,
  warningMessage: PropTypes.string,
  showTooltip: PropTypes.bool,
  hideWhenDenied: PropTypes.bool,
  children: PropTypes.node,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  type: PropTypes.string,
  size: PropTypes.string,
  icon: PropTypes.node,
  className: PropTypes.string,
  style: PropTypes.object,
};

/**
 * Pre-configured permission buttons for common actions
 */

export const ApproveButton = (props) => (
  <PermissionButton
    type='primary'
    icon={<ExclamationCircleOutlined />}
    warningType='CANNOT_APPROVE'
    {...props}
    permission={props.permission || 'accounting.approve'}
  >
    {props.children || 'อนุมัติ'}
  </PermissionButton>
);

ApproveButton.propTypes = {
  permission: PropTypes.string,
  children: PropTypes.node,
};

export const EditButton = (props) => (
  <PermissionButton
    type='default'
    warningType='CANNOT_EDIT'
    {...props}
    permission={props.permission || 'accounting.edit'}
  >
    {props.children || 'แก้ไข'}
  </PermissionButton>
);

EditButton.propTypes = {
  permission: PropTypes.string,
  children: PropTypes.node,
};

export const DeleteButton = (props) => (
  <PermissionButton
    type='danger'
    warningType='CANNOT_DELETE'
    {...props}
    permission={props.permission || 'accounting.delete'}
  >
    {props.children || 'ลบ'}
  </PermissionButton>
);

DeleteButton.propTypes = {
  permission: PropTypes.string,
  children: PropTypes.node,
};

export const CreateButton = (props) => (
  <PermissionButton
    type='primary'
    warningType='CANNOT_CREATE'
    {...props}
    permission={props.permission || 'accounting.create'}
  >
    {props.children || 'สร้างใหม่'}
  </PermissionButton>
);

CreateButton.propTypes = {
  permission: PropTypes.string,
  children: PropTypes.node,
};

export const ViewButton = (props) => (
  <PermissionButton
    type='default'
    warningType='CANNOT_VIEW'
    {...props}
    permission={props.permission || 'accounting.view'}
  >
    {props.children || 'ดูรายละเอียด'}
  </PermissionButton>
);

ViewButton.propTypes = {
  permission: PropTypes.string,
  children: PropTypes.node,
};

export default PermissionButton;
