/**
 * StandardPopconfirm Component
 * Ensures consistent styling and center-aligned buttons for all confirmation dialogs
 */

import React from 'react';
import { Popconfirm } from 'antd';
import PropTypes from 'prop-types';

const StandardPopconfirm = ({
  title,
  description,
  onConfirm,
  onCancel,
  okText = "ตกลง",
  cancelText = "ยกเลิก",
  okType = "primary",
  placement = "top",
  children,
  ...props
}) => {
  return (
    <Popconfirm
      title={title}
      description={description}
      onConfirm={onConfirm}
      onCancel={onCancel}
      okText={okText}
      cancelText={cancelText}
      okType={okType}
      placement={placement}
      overlayClassName="standard-popconfirm"
      overlayStyle={{
        zIndex: 1050
      }}
      {...props}
    >
      {children}
    </Popconfirm>
  );
};

StandardPopconfirm.propTypes = {
  title: PropTypes.node.isRequired,
  description: PropTypes.node,
  onConfirm: PropTypes.func,
  onCancel: PropTypes.func,
  okText: PropTypes.string,
  cancelText: PropTypes.string,
  okType: PropTypes.oneOf(['primary', 'danger', 'default']),
  placement: PropTypes.oneOf(['top', 'bottom', 'left', 'right', 'topLeft', 'topRight', 'bottomLeft', 'bottomRight']),
  children: PropTypes.node.isRequired
};

export default StandardPopconfirm;

// Export convenience components for common use cases
export const ApprovalPopconfirm = ({ onConfirm, children, ...props }) => (
  <StandardPopconfirm
    title="อนุมัติรายการนี้?"
    description="การดำเนินการนี้ไม่สามารถยกเลิกได้"
    okText="อนุมัติ"
    cancelText="ยกเลิก"
    okType="primary"
    onConfirm={onConfirm}
    {...props}
  >
    {children}
  </StandardPopconfirm>
);

ApprovalPopconfirm.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export const RejectPopconfirm = ({ onConfirm, children, ...props }) => (
  <StandardPopconfirm
    title="ปฏิเสธรายการนี้?"
    description="กรุณาระบุเหตุผลในการปฏิเสธ"
    okText="ปฏิเสธ"
    cancelText="ยกเลิก"
    okType="danger"
    onConfirm={onConfirm}
    {...props}
  >
    {children}
  </StandardPopconfirm>
);

RejectPopconfirm.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
};

export const DeletePopconfirm = ({ onConfirm, children, itemName = "รายการ", ...props }) => (
  <StandardPopconfirm
    title={`ลบ${itemName}นี้?`}
    description="การดำเนินการนี้ไม่สามารถยกเลิกได้"
    okText="ลบ"
    cancelText="ยกเลิก"
    okType="danger"
    onConfirm={onConfirm}
    {...props}
  >
    {children}
  </StandardPopconfirm>
);

DeletePopconfirm.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired,
  itemName: PropTypes.string
};

export const SavePopconfirm = ({ onConfirm, children, ...props }) => (
  <StandardPopconfirm
    title="บันทึกข้อมูล?"
    description="ตรวจสอบข้อมูลให้ถูกต้องก่อนบันทึก"
    okText="บันทึก"
    cancelText="ยกเลิก"
    okType="primary"
    onConfirm={onConfirm}
    {...props}
  >
    {children}
  </StandardPopconfirm>
);

SavePopconfirm.propTypes = {
  onConfirm: PropTypes.func.isRequired,
  children: PropTypes.node.isRequired
}; 