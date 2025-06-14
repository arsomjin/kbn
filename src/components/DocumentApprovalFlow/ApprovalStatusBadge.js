/**
 * Approval Status Badge Component
 * 
 * A reusable component for displaying document approval status with
 * consistent styling, colors, and icons across the application.
 */

import React from 'react';
import PropTypes from 'prop-types';
import { Tag, Tooltip } from 'antd';
import { 
  CheckCircleOutlined, 
  CloseCircleOutlined, 
  ExclamationCircleOutlined,
  ClockCircleOutlined,
  FileTextOutlined,
  SendOutlined,
  EyeOutlined,
  ToolOutlined,
  SafetyOutlined
} from '@ant-design/icons';

/**
 * Status configuration with colors, icons, and labels
 */
const STATUS_CONFIG = {
  // Common statuses
  'draft': {
    color: '#d9d9d9',
    icon: <FileTextOutlined />,
    label: 'ฉบับร่าง',
    description: 'เอกสารยังอยู่ในขั้นตอนการสร้าง'
  },
  'submitted': {
    color: '#faad14',
    icon: <SendOutlined />,
    label: 'ส่งแล้ว',
    description: 'ส่งเอกสารเพื่อตรวจสอบแล้ว'
  },
  'review': {
    color: '#faad14',
    icon: <EyeOutlined />,
    label: 'รอตรวจสอบ',
    description: 'รอผู้มีอำนาจตรวจสอบเอกสาร'
  },
  'reviewed': {
    color: '#1890ff',
    icon: <EyeOutlined />,
    label: 'ตรวจสอบแล้ว',
    description: 'ตรวจสอบเอกสารเรียบร้อยแล้ว'
  },
  'approved': {
    color: '#52c41a',
    icon: <CheckCircleOutlined />,
    label: 'อนุมัติแล้ว',
    description: 'เอกสารได้รับการอนุมัติแล้ว'
  },
  'rejected': {
    color: '#ff4d4f',
    icon: <CloseCircleOutlined />,
    label: 'ปฏิเสธ',
    description: 'เอกสารถูกปฏิเสธ'
  },
  'cancelled': {
    color: '#8c8c8c',
    icon: <ExclamationCircleOutlined />,
    label: 'ยกเลิก',
    description: 'เอกสารถูกยกเลิก'
  },
  'completed': {
    color: '#52c41a',
    icon: <CheckCircleOutlined />,
    label: 'เสร็จสิ้น',
    description: 'ดำเนินการเสร็จสิ้นแล้ว'
  },
  'pending': {
    color: '#faad14',
    icon: <ClockCircleOutlined />,
    label: 'รอดำเนินการ',
    description: 'รอดำเนินการในขั้นตอนถัดไป'
  },
  'in_progress': {
    color: '#1890ff',
    icon: <ToolOutlined />,
    label: 'กำลังดำเนินการ',
    description: 'อยู่ระหว่างการดำเนินการ'
  },
  
  // Sales-specific statuses
  'price_review': {
    color: '#faad14',
    icon: <EyeOutlined />,
    label: 'รอตรวจสอบราคา',
    description: 'รอตรวจสอบและอนุมัติราคาขาย'
  },
  'delivered': {
    color: '#52c41a',
    icon: <CheckCircleOutlined />,
    label: 'จัดส่งแล้ว',
    description: 'จัดส่งสินค้าเรียบร้อยแล้ว'
  },
  
  // Service-specific statuses
  'received': {
    color: '#1890ff',
    icon: <FileTextOutlined />,
    label: 'รับงานแล้ว',
    description: 'รับงานซ่อมเรียบร้อยแล้ว'
  },
  'assessed': {
    color: '#faad14',
    icon: <EyeOutlined />,
    label: 'ประเมินแล้ว',
    description: 'ประเมินงานซ่อมเรียบร้อยแล้ว'
  },
  'quality_check': {
    color: '#1890ff',
    icon: <SafetyOutlined />,
    label: 'ตรวจสอบคุณภาพ',
    description: 'อยู่ระหว่างตรวจสอบคุณภาพงาน'
  },
  
  // Inventory-specific statuses
  'inspection': {
    color: '#faad14',
    icon: <EyeOutlined />,
    label: 'รอตรวจสอบ',
    description: 'รอตรวจสอบสินค้าที่นำเข้า'
  },
  'recorded': {
    color: '#52c41a',
    icon: <CheckCircleOutlined />,
    label: 'บันทึกแล้ว',
    description: 'บันทึกเข้าระบบคลังสินค้าแล้ว'
  }
};

/**
 * Approval Status Badge Component
 * @param {Object} props
 * @param {string} props.status - Status value
 * @param {string} props.customLabel - Custom label override
 * @param {string} props.customColor - Custom color override
 * @param {React.ReactNode} props.customIcon - Custom icon override
 * @param {boolean} props.showIcon - Show status icon
 * @param {boolean} props.showTooltip - Show tooltip with description
 * @param {'default'|'small'|'large'} props.size - Badge size
 * @param {string} props.className - Additional CSS classes
 * @param {Object} props.style - Additional inline styles
 */
const ApprovalStatusBadge = ({
  status,
  customLabel = null,
  customColor = null,
  customIcon = null,
  showIcon = true,
  showTooltip = true,
  size = 'default',
  className = '',
  style = {}
}) => {
  // Get status configuration
  const config = STATUS_CONFIG[status] || {
    color: '#d9d9d9',
    icon: <FileTextOutlined />,
    label: status || 'ไม่ระบุ',
    description: 'สถานะไม่ทราบ'
  };

  // Determine final values
  const finalLabel = customLabel || config.label;
  const finalColor = customColor || config.color;
  const finalIcon = customIcon || (showIcon ? config.icon : null);

  // Size-based styling
  const getSizeStyle = () => {
    switch (size) {
      case 'small':
        return {
          fontSize: '12px',
          padding: '2px 8px',
          lineHeight: '18px'
        };
      case 'large':
        return {
          fontSize: '16px',
          padding: '6px 16px',
          lineHeight: '24px'
        };
      default:
        return {
          fontSize: '14px',
          padding: '4px 12px',
          lineHeight: '20px'
        };
    }
  };

  // Create the badge element
  const badge = (
    <Tag
      icon={finalIcon}
      color={finalColor}
      className={`approval-status-badge ${className}`}
      style={{
        ...getSizeStyle(),
        borderRadius: '6px',
        fontWeight: 500,
        display: 'inline-flex',
        alignItems: 'center',
        gap: '4px',
        ...style
      }}
    >
      {finalLabel}
    </Tag>
  );

  // Wrap with tooltip if enabled
  if (showTooltip && config.description) {
    return (
      <Tooltip title={config.description} placement="top">
        {badge}
      </Tooltip>
    );
  }

  return badge;
};

ApprovalStatusBadge.propTypes = {
  status: PropTypes.string.isRequired,
  customLabel: PropTypes.string,
  customColor: PropTypes.string,
  customIcon: PropTypes.node,
  showIcon: PropTypes.bool,
  showTooltip: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'default', 'large']),
  className: PropTypes.string,
  style: PropTypes.object
};

export default ApprovalStatusBadge;
export { STATUS_CONFIG }; 