import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form } from 'antd';
import type { FormInstance } from 'antd';
import dayjs from 'dayjs';
import { useLocation } from 'react-router-dom';
import { showLog, isDateTypeField } from '../../utils/functions';
import { EditableContext, getInputNode } from './index';
import { TableBaseRecord } from '../../types/table';

interface EditableEachCellProps {
  title: React.ReactNode;
  editable?: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: TableBaseRecord;
  handleSave: (record: TableBaseRecord) => void;
  number?: boolean;
  required?: boolean;
  deletable?: boolean;
  [key: string]: any;
}

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
  const inputRef = useRef<any>(null);
  const form = useContext(EditableContext) as FormInstance;
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
    form.setFieldsValue({
      [dataIndex]: isDate ? dayjs(record[dataIndex], 'YYYY-MM-DD') : record[dataIndex]
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
    } catch (errInfo) {
      // Handle validation errors silently
    }
  };

  const onBlur = () => save();

  let childNode = children;

  if (editable) {
    const INode = getInputNode({
      dataIndex,
      number,
      ref: inputRef,
      save,
      record,
      onBlur,
      path
    });

    childNode = editing ? (
      <Form.Item
        style={{
          margin: 0
        }}
        name={dataIndex}
        rules={
          required
            ? [
                {
                  required: true,
                  message: `กรุณาป้อน ${title}`
                },
                vProps => ({
                  validator(rule, value) {
                    if (number) {
                      if (!value || !isNaN(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject('กรุณาป้อนเป็นตัวเลข');
                    }
                    return Promise.resolve();
                  }
                })
              ]
            : [
                vProps => ({
                  validator(rule, value) {
                    if (number) {
                      if (!value || !isNaN(value)) {
                        return Promise.resolve();
                      }
                      return Promise.reject('กรุณาป้อนเป็นตัวเลข');
                    }
                    return Promise.resolve();
                  }
                })
              ]
        }
      >
        {INode}
      </Form.Item>
    ) : (
      <div
        className='editable-cell-value-wrap'
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
