import React, { useRef } from 'react';
import { Form } from 'antd';
import { createValidator, getInputNode } from '.';
import { useLocation } from 'react-router-dom';

export const EditableCell = ({
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
  // showLog('editableCell_props', restProps);
  const tdRef = useRef(null);
  const inputRef = useRef(null);
  let location = useLocation();
  const path = location.pathname;

  const handleKeyDown = (event, row) => {
    if (event.key === 'Enter') {
      // If the input field is empty, automatically trigger blur to move to the next cell
      if (inputRef.current && (!inputRef.current.value || inputRef.current.value.trim() === '')) {
        onBlur(dataIndex);
        return;
      }
    }
    onKeyDown(event.key, dataIndex);
  };

  const handleBlur = e => {
    // showLog('blur', e);
    onBlur(dataIndex);
  };

  let childNode = children;

  // showLog({ dataIndex, editable, editing });
  if (editing) {
    let INode = getInputNode({
      dataIndex,
      number,
      ref: inputRef,
      size,
      record,
      onBlur,
      path
    });
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
