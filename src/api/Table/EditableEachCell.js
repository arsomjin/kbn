import React, { useContext, useEffect, useRef, useState } from 'react';
import { Form } from 'antd';
import moment from 'moment';
import { showLog, isDateTypeField } from 'functions';
import { createValidator, EditableContext, getInputNode } from '.';
import { useLocation } from 'react-router-dom';

export const EditableEachCell = ({
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
  const inputRef = useRef(null);
  const form = useContext(EditableContext);
  let location = useLocation();
  const path = location.pathname;

  useEffect(() => {
    // showLog('ref', inputRef.current);
    if (editing) {
      inputRef.current.focus();
    }
  }, [editing]);

  const toggleEdit = () => {
    if (record.deleted) {
      return showLog('This record has been deleted.');
    }
    setEditing(!editing);
    //  showLog('editing', record[dataIndex]);
    const isDate = isDateTypeField(dataIndex);
    form.setFieldsValue({
      [dataIndex]: isDate ? moment(record[dataIndex], 'YYYY-MM-DD') : record[dataIndex]
    });
  };

  const save = async () => {
    try {
      const values = await form.validateFields();
      toggleEdit();
      handleSave({ ...record, ...values });
      // showLog('saved', { ...record, ...values });
    } catch (errInfo) {
      //  showLog('Save failed:', errInfo);
      // form.scrollToField(errInfo.errorFields[0].name[0]);
    }
  };

  const onBlur = () => save();

  let childNode = children;

  if (editable) {
    // showLog({ required, number });
    let INode = getInputNode({
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
                vProps => createValidator({ dataIndex, number, ...vProps })
              ]
            : [vProps => createValidator({ dataIndex, number, ...vProps })]
        }
      >
        {INode}
        {/* <Input ref={inputRef} onPressEnter={save} onBlur={save} /> */}
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
