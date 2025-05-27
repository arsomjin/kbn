import React, { useEffect, useRef, useContext } from 'react';
import { Form, Input } from 'antd';
import { EditableContext } from './EditableRow';
import { getInputNode } from 'api/Table'; // your function
import { getValidationRules } from './helper';

const EditableCell = ({
  record,
  dataIndex,
  title,
  children,
  editable,
  handleSave,
  columns, // pass your columns array so we know which column is next
  editingCell, // { key, dataIndex } of the currently editing cell
  setEditingCell, // function to update which cell is active
  rowKey, // e.g. record.key
  rowIndex, // numeric index in data
  colIndex, // numeric index in columns
  align,
  ...restProps
}) => {
  const form = useContext(EditableContext);
  const inputRef = useRef(null);

  // Tracks if we replaced '0' with '' for this cell
  const replacedZeroRef = useRef(false);

  const isCurrentlyEditing = editable && editingCell?.key === rowKey && editingCell?.dataIndex === dataIndex;

  // Focus as soon as we become the active cell:
  useEffect(() => {
    if (isCurrentlyEditing) {
      const currentVal = record[dataIndex];
      // If the underlying value is 0, replace it with '' in the form:
      // showLog({ currentVal })
      if (['0', 0, '0.00'].includes(currentVal)) {
        form.setFieldsValue({ [dataIndex]: '' });
        replacedZeroRef.current = true;
      } else {
        form.setFieldsValue({ [dataIndex]: currentVal });
        replacedZeroRef.current = false;
      }
      inputRef.current && inputRef.current.focus();
    }
  }, [isCurrentlyEditing, record, dataIndex, form]);

  // Move to the next cell:
  const moveToNextCell = async updatedRow => {
    const nextColIndex = colIndex + 1;
    let foundColumn;
    for (let i = nextColIndex; i < columns.length; i++) {
      if (columns[i].editable) {
        foundColumn = columns[i];
        break;
      }
    }
    if (foundColumn) {
      setEditingCell({ key: rowKey, dataIndex: foundColumn.dataIndex });
    } else {
      try {
        // Validate all fields in this row before finishing editing.
        await form.validateFields();
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
    try {
      const values = await form.validateFields([dataIndex]);
      let newValue = values[dataIndex];

      // Only revert '' back to 0 if we originally converted 0 -> '' in useEffect
      if (replacedZeroRef.current && newValue === '') {
        newValue = 0;
      }

      const updatedRow = { ...record, [dataIndex]: newValue }; // Pass up the new row to parent
      handleSave(updatedRow, dataIndex, rowIndex);
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
      <Form.Item name={dataIndex} style={{ margin: 0 }} rules={getValidationRules(dataIndex)}>
        {React.cloneElement(
          getInputNode({
            dataIndex,
            record,
            ref: inputRef,
            save: saveCell
            // For some custom components, use onSelect or onChange
            // to immediately save and move focus:
            // onSelect: () => saveCell(),
            // onChange: () => saveCell(),
          }) || (
            <Input
              ref={inputRef}
              onBlur={saveCell}
              onPressEnter={() => {
                if (inputRef.current && (!inputRef.current.value || inputRef.current.value.trim() === '')) {
                  inputRef.current.blur();
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
          ),
          {
            onBlur: saveCell
          }
        )}
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
        onClick={() => setEditingCell({ key: rowKey, dataIndex })}
      >
        {children}
      </div>
    );
  }

  return <td {...restProps}>{childNode}</td>;
};

export default EditableCell;
