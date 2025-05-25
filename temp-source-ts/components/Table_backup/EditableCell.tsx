import React, { useEffect, useRef, useContext } from 'react';
import { Form, Input } from 'antd';
import type { InputRef } from 'antd';
import type { Rule } from 'antd/es/form';
import { EditableContext } from './EditableRow';
import { getInputNode } from 'api/Table';
import { getValidationRules } from './helper';
import { EditableCellProps, TableData } from './types';

const EditableCell: React.FC<EditableCellProps> = ({
  record,
  dataIndex,
  title,
  children,
  editable,
  handleSave,
  columns = [],
  editingCell,
  setEditingCell,
  rowKey,
  rowIndex,
  colIndex = 0,
  align,
  ...restProps
}) => {
  const form = useContext(EditableContext);
  const inputRef = useRef<InputRef>(null);

  // Tracks if we replaced '0' with '' for this cell
  const replacedZeroRef = useRef(false);

  const isCurrentlyEditing = editable && editingCell?.key === rowKey && editingCell?.dataIndex === dataIndex;

  // Focus as soon as we become the active cell:
  useEffect(() => {
    if (isCurrentlyEditing && form) {
      const currentVal = record[dataIndex];
      // If the underlying value is 0, replace it with '' in the form:
      if (['0', 0, '0.00'].includes(currentVal as string | number)) {
        form.setFieldsValue({ [dataIndex]: '' });
        replacedZeroRef.current = true;
      } else {
        form.setFieldsValue({ [dataIndex]: currentVal });
        replacedZeroRef.current = false;
      }
      inputRef.current?.focus();
    }
  }, [isCurrentlyEditing, record, dataIndex, form]);

  // Move to the next cell:
  const moveToNextCell = async (updatedRow: TableData) => {
    if (!setEditingCell || !rowKey) return;

    const nextColIndex = colIndex + 1;
    let foundColumn;
    for (let i = nextColIndex; i < columns.length; i++) {
      const column = columns[i];
      if ('editable' in column && column.editable) {
        foundColumn = column;
        break;
      }
    }
    if (foundColumn && 'dataIndex' in foundColumn && typeof foundColumn.dataIndex === 'string') {
      setEditingCell({ key: rowKey, dataIndex: foundColumn.dataIndex });
    } else {
      try {
        // Validate all fields in this row before finishing editing.
        await form?.validateFields();
        // If validation passes, finish editing (which may trigger new row addition)
        setEditingCell(null);
      } catch (error) {
        console.warn('Row validation failed:', error);
        // Remain in editing mode so user can correct errors.
      }
    }
  };

  // Save current cell, then optionally jump to the next:
  const saveCell = async () => {
    if (!handleSave || !rowIndex) return;

    try {
      const values = await form?.validateFields([dataIndex]);
      if (!values) return;

      let newValue = values[dataIndex];

      // Only revert '' back to 0 if we originally converted 0 -> '' in useEffect
      if (replacedZeroRef.current && newValue === '') {
        newValue = 0;
      }

      const updatedRow = { ...record, [dataIndex]: newValue }; // Pass up the new row to parent
      handleSave(updatedRow);
      // Move focus
      moveToNextCell(updatedRow);
    } catch (err) {
      console.warn('Validate error:', err);
    }
  };

  let childNode = children;

  if (editable) {
    // If we are the active cell, show an input. Otherwise, show normal text.
    childNode = isCurrentlyEditing ? (
      <Form.Item name={dataIndex} style={{ margin: 0 }} rules={getValidationRules(dataIndex) as Rule[]}>
        {(() => {
          const inputNode = getInputNode({
            dataIndex,
            record,
            ref: inputRef as React.RefObject<InputRef>,
            save: saveCell
          });

          if (React.isValidElement(inputNode)) {
            return React.cloneElement(inputNode, {
              onBlur: saveCell
            } as React.ComponentProps<typeof Input>);
          }

          return (
            <Input
              ref={inputRef}
              onBlur={saveCell}
              onPressEnter={() => {
                const input = inputRef.current?.input;
                if (input && (!input.value || input.value.trim() === '')) {
                  inputRef.current?.blur();
                } else {
                  saveCell();
                }
              }}
              style={
                align === 'center'
                  ? { textAlign: 'center' }
                  : align === 'left'
                    ? { textAlign: 'left' }
                    : align === 'right'
                      ? { textAlign: 'right' }
                      : {}
              }
            />
          );
        })()}
      </Form.Item>
    ) : (
      // If not active, clicking sets this cell as active
      <div
        style={{
          minHeight: 20,
          cursor: 'pointer',
          ...(align === 'center'
            ? { textAlign: 'center' }
            : align === 'left'
              ? { textAlign: 'left' }
              : align === 'right'
                ? { textAlign: 'right' }
                : {})
        }}
        onClick={() => {
          if (setEditingCell && rowKey && dataIndex) {
            setEditingCell({ key: rowKey, dataIndex });
          }
        }}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

export default EditableCell;
