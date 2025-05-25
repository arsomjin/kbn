import React, { useCallback, useEffect, useState } from 'react';
import { Card, Row, Button } from 'antd';
import { Form, Modal, Button as AntButton } from 'antd';
import { showConfirm, showWarn, cleanValuesBeforeSave, getChanges } from '../../../../utils/functions';
import { isMobile } from 'react-device-detect';
import { w } from '../../../../api';
import { useSelector } from 'react-redux';
import { getNameFromEmployeeCode } from '../../../Utils';
import { renderInput } from './api';
import { CheckOutlined, CloseOutlined } from '@ant-design/icons';
import { RootState } from '../../../../store';
import { LeaveRecord } from './types';
import { useAntdUi } from '../../../../hooks/useAntdUi';

/**
 * Props interface for EditLeave component
 */
interface EditLeaveProps {
  selectedData?: Partial<LeaveRecord>;
  visible: boolean;
  onOk?: (data: any) => void;
  onCancel?: () => void;
  POSITIONS: string[];
  grant?: any;
  [key: string]: any;
}

/**
 * Edit Leave Modal Component
 */
const EditLeave: React.FC<EditLeaveProps> = ({
  selectedData = {},
  visible,
  onOk,
  onCancel,
  POSITIONS,
  grant,
  ...mProps
}) => {
  const { user } = useSelector((state: RootState) => state.auth);
  const { employees } = useSelector((state: RootState) => state.employees);

  const [form] = Form.useForm();
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    if (visible) {
      form.resetFields();
      form.setFieldsValue(selectedData);
    }
  }, [form, selectedData, visible]);

  const onConfirm = useCallback(
    async (mValues: any) => {
      try {
        if (!user) return;

        setLoading(true);
        let newValues = cleanValuesBeforeSave(mValues);
        const oldValues = JSON.parse(JSON.stringify(selectedData));
        let changes = getChanges(oldValues, newValues);
        newValues.editedBy = !!selectedData.editedBy
          ? [...selectedData.editedBy, { uid: user.uid, time: Date.now(), changes }]
          : [{ uid: user.uid, time: Date.now(), changes }];
        setLoading(false);
        onOk &&
          onOk({
            ...selectedData,
            ...newValues
          });
      } catch (e) {
        showWarn(e);
        setLoading(false);
      }
    },
    [onOk, selectedData, user]
  );

  const onPreConfirm = useCallback(
    (values: any) => {
      const employeeName = getNameFromEmployeeCode({
        employeeCode: values.employeeId || '',
        employees
      });
      showConfirm(Modal, () => onConfirm(values), `บันทึกข้อมูลของ ${employeeName}`);
    },
    [employees, onConfirm]
  );

  const onDeleteConfirm = useCallback(() => {
    const employeeName = getNameFromEmployeeCode({
      employeeCode: selectedData.employeeId || '',
      employees
    });
    showConfirm(Modal, () => onConfirm({ ...selectedData, deleted: true }), `ลบรายการของ ${employeeName}`);
  }, [employees, onConfirm, selectedData]);

  if (!visible) {
    return null;
  }

  const employeeName = getNameFromEmployeeCode({
    employeeCode: selectedData.employeeId || '',
    employees
  });

  const buttons = [
    <Button key='close' onClick={() => onCancel && onCancel()}>
      ยกเลิก
    </Button>,
    <Button key='delete' icon={<CloseOutlined />} onClick={() => onDeleteConfirm()}>
      ลบ
    </Button>,
    <Button
      key='ok'
      icon={<CheckOutlined />}
      onClick={() => {
        form
          .validateFields()
          .then((values: any) => {
            onPreConfirm(values);
          })
          .catch((info: any) => {
            console.log('Validate Failed:', info);
          });
      }}
      type='primary'
    >
      บันทึก
    </Button>
  ];

  return (
    <Modal
      title={`แก้ไขข้อมูลการลางาน ${employeeName}`}
      open={visible}
      onOk={() => {
        form
          .validateFields()
          .then((values: any) => {
            onPreConfirm(values);
          })
          .catch((info: any) => {
            console.log('Validate Failed:', info);
          });
      }}
      onCancel={onCancel}
      footer={buttons}
      width={isMobile ? w(92) : w(77)}
      style={{ left: isMobile ? 0 : w(7) }}
      destroyOnClose
    >
      <Form form={form} onFinish={onPreConfirm} size='small' initialValues={selectedData} layout='vertical'>
        <Card size='small' className='mb-4'>
          <Form.Item name='dataId' hidden>
            <input type='hidden' />
          </Form.Item>

          {selectedData.editedBy && selectedData.editedBy.length > 0 && (
            <Row className='mb-3 ml-2' style={{ alignItems: 'center' }}>
              <div className='text-orange-500'>แก้ไขแล้ว {selectedData.editedBy.length} ครั้ง</div>
            </Row>
          )}

          {renderInput({ POSITIONS, values: form.getFieldsValue() })}
        </Card>
      </Form>
    </Modal>
  );
};

export default EditLeave;
