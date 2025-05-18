import React, { useRef, KeyboardEvent } from 'react';
import { Form, Input } from 'antd';
import type { InputRef } from 'antd';
import type { Rule } from 'antd/es/form';
import { useLocation } from 'react-router-dom';
import { getInputNode } from './index';
import { TableData } from 'components/Table/types';

interface EditableCellProps {
  title: string;
  editable?: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: TableData;
  number?: boolean;
  required?: boolean;
  editing?: boolean;
  index?: number;
  onKeyDown: (key: string, dataIndex: string) => void;
  onBlur: (dataIndex: string) => void;
  size?: 'small' | 'middle' | 'large';
  [key: string]: unknown;
}

export const EditableCell: React.FC<EditableCellProps> = ({
  title,
  editable,
  children,
  dataIndex,
  record,
  number,
  required,
  editing,
  index,
  onKeyDown,
  onBlur,
  size,
  ...restProps
}) => {
  const tdRef = useRef<HTMLTableCellElement>(null);
  const inputRef = useRef<InputRef>(null);
  const location = useLocation();
  const path = location.pathname;

  const handleKeyDown = (event: KeyboardEvent<HTMLTableCellElement>) => {
    if (event.key === 'Enter') {
      // If the input field is empty, automatically trigger blur to move to the next cell
      const input = inputRef.current?.input;
      if (input && (!input.value || input.value.trim() === '')) {
        onBlur(dataIndex);
        return;
      }
    }
    onKeyDown(event.key, dataIndex);
  };

  const handleBlur = () => {
    onBlur(dataIndex);
  };

  let childNode = children;

  if (editing) {
    const inputNode = getInputNode({
      dataIndex,
      record,
      ref: inputRef,
      save: () => onBlur(dataIndex),
      size,
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

    return (
      <td
        ref={tdRef}
        onKeyDown={handleKeyDown}
        onBlur={handleBlur}
        {...restProps}
        style={{
          paddingTop: 0,
          paddingBottom: 0
        }}
      >
        {editable ? (
          <Form.Item
            name={dataIndex}
            style={{
              margin: 0
            }}
            rules={rules}
          >
            {inputNode}
          </Form.Item>
        ) : (
          childNode
        )}
      </td>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
