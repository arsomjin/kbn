import React, { useContext, useEffect, useRef } from 'react';
import { Form } from 'antd';
import { useLocation } from 'react-router-dom';
import { createValidator, EditableContext, getInputNode } from './index';

interface EditableCellProps {
  title: React.ReactNode;
  editable: boolean;
  children: React.ReactNode;
  dataIndex: string;
  record: any;
  number?: boolean;
  required?: boolean;
  editing: boolean;
  index: number;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>, dataIndex: string) => void;
  onBlur?: () => void;
  size?: 'small' | 'middle' | 'large';
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
  const form = useContext(EditableContext)!;
  const location = useLocation();
  const tdRef = useRef(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const cellRef = useRef<HTMLTableCellElement>(null);

  useEffect(() => {
    if (editing) {
      inputRef.current?.focus();
    }
  }, [editing]);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (onKeyDown) {
      onKeyDown(e, dataIndex);
    }
  };

  const handleBlur = () => {
    if (onBlur) {
      onBlur();
    }
  };

  let childNode = children;

  if (editing) {
    let INode = getInputNode({
      dataIndex,
      number,
      ref: inputRef,
      size,
      record,
      onBlur
    });
    if (
      React.isValidElement(INode) &&
      (INode.type === 'input' || INode.type === 'textarea') &&
      !(INode.props as any).onKeyDown
    ) {
      INode = React.cloneElement(INode as React.ReactElement<any>, {
        onKeyDown: handleKeyDown as any
      });
    }
    return (
      <td
        ref={tdRef}
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
            rules={
              required
                ? [
                    {
                      required: true,
                      message: `กรุณาป้อน ${title}`
                    },
                    vProps =>
                      createValidator({
                        dataIndex,
                        number,
                        ...vProps
                      })
                  ]
                : [
                    vProps =>
                      createValidator({
                        dataIndex,
                        number,
                        ...vProps
                      })
                  ]
            }
          >
            {INode}
          </Form.Item>
        ) : (
          childNode
        )}
      </td>
    );
  }
  return <td {...restProps}>{childNode}</td>;
};
