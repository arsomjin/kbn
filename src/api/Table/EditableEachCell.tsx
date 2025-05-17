import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form, Input } from 'antd';
import type { InputRef } from 'antd';
import type { Rule } from 'antd/es/form';
import { DateTime } from 'luxon';
import { useLocation } from 'react-router-dom';
import { EditableContext } from 'components/Table/EditableRow';
import { getInputNode } from './index';
import { TableData } from 'components/Table/types';
import { showLog } from 'utils/functions';

interface EditableEachCellProps {
  title: string;
  editable?: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: TableData;
  handleSave: (record: TableData) => void;
  number?: boolean;
  required?: boolean;
  deletable?: boolean;
  [key: string]: unknown;
}

const isDateTypeField = (fieldName: string): boolean => {
  return ['date', 'inputDate', 'createdAt', 'updatedAt'].includes(fieldName);
};

export const EditableEachCell: React.FC<EditableEachCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  handleSave,
  number,
  required,
  deletable,
  ...restProps
}) => {
  const [editing, setEditing] = useState(false);
  const inputRef = useRef<InputRef>(null);
  const form = useContext(EditableContext);
  const location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    if (editing && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    if (record.deleted) {
      return showLog('This record has been deleted.');
    }
    setEditing(!editing);
    
    const isDate = isDateTypeField(dataIndex);
    const value = record[dataIndex];
    
    if (form) {
      form.setFieldsValue({
        [dataIndex]: isDate && value ? DateTime.fromISO(value as string) : value
      });
    }
  };

  const save = async () => {
    if (!form) return;
    
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      console.warn('Save failed:', errInfo);
    }
  };

  const onBlur = () => save();

  let childNode = children;

  if (editable) {
    const inputNode = getInputNode({
      dataIndex,
      record,
      ref: inputRef,
      save,
      onBlur,
      path
    });

    const rules: Rule[] = [
      ...(required ? [{
        required: true,
        message: `กรุณาป้อน ${title}`
      }] : []),
      ...(number ? [{
        type: 'number' as const,
        transform: (value: string) => Number(value),
        message: 'กรุณาป้อนตัวเลข'
      }] : [])
    ];

    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0
        }}
        name={dataIndex}
        rules={rules}
      >
        {inputNode}
      </Form.Item>
    ) : (
      <div
        className="editable-cell-value-wrap"
        style={{
          paddingRight: 24
        }}
        onClick={toggleEdit}
      >
        {children}
      </div>
    );
  }

  return (
    <td
      style={{
        paddingTop: 0,
        paddingBottom: 0
      }}
      {...restProps}
    >
      {childNode}
    </td>
  );
};
