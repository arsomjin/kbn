import React, { useEffect, useState } from 'react';
import { Table, Form, Button } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { EditableCell } from 'api/Table/EditableCell';
import { GetColumns } from 'api/Table';
import { h } from 'api/Dimensions';
import { waitFor, Numb } from 'utils/functions';
import { Button as CustomButton } from 'elements';
import { useModal } from 'contexts/ModalContext';

const EditableRowTable = ({
  columns,
  dataSource,
  scroll,
  size,
  locale,
  footer,
  initialItemValues,
  onAdd,
  onDelete,
  onUpdate,
  forceValidate,
  noScroll,
  pagination,
  miniAddButton,
  handleEdit,
  handleSelect,
  disabled,
  readOnly,
  rowClassName,
  deletedButtonAtEnd,
  ...tableProps
}) => {
  const [form] = Form.useForm();
  const [data, setData] = useState(dataSource);
  const [editingKey, setEditingKey] = useState('');
  const { showWarn } = useModal();

  const isEditing = (record) => record.key === editingKey;

  useEffect(() => {
    const row = form.getFieldsValue();
    //  showLog({ dataSource, row, editingKey });
    const editKey = dataSource.findIndex((l) => l.key === editingKey);
    if (editKey > -1) {
      let mUpdate = {};
      Object.keys(row).map((k) => {
        // Filter only valid fields
        mUpdate[k] = dataSource[editKey][k];
        return k;
      });
      form.setFieldsValue(mUpdate);
    }
    setData(dataSource);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource]);

  const edit = async (record, rowIndex) => {
    try {
      //  showLog({ edit: { record, rowIndex } });
      // Save previous editing row.
      let dArr = await save(editingKey);
      // Set new editing row.
      setEditingKey(record.key);
      form.setFieldsValue({
        ...initialItemValues,
        ...record,
      });
      // await waitFor();
      handleSave(dArr.data, null, rowIndex);
    } catch (e) {
      showWarn(e.message || e);
    }
  };

  const save = (key, isDelete) =>
    new Promise((r, j) => {
      const performSave = async () => {
        try {
          // Validate fields.
          const row =
            (forceValidate || forceValidate === 0) && !isDelete
              ? await form.validateFields()
              : await form.getFieldsValue();
          // Save row.
          // showLog({ save: { row, data, key } });
          let newData = [...data];
          const index = newData.findIndex((item) => key === item.key);

          if (index > -1) {
            const item = newData[index];
            let mRow = { ...row };
            Object.keys(row).map((k) => {
              if (row[k] === undefined) {
                mRow[k] = null;
              }
              return mRow;
            });
            newData.splice(index, 1, { ...item, ...mRow });
            r({ item: { ...item, ...mRow }, data: newData, rowIndex: key });
          }
          r({ item: row, data: newData, rowIndex: key });
        } catch (errInfo) {
          console.log('Validate Failed:', errInfo);
          j(errInfo);
        }
      };
      performSave();
    });

  const handleSave = (arr, dataIndex, rowIndex) => {
    onUpdate && onUpdate(arr, dataIndex, rowIndex);
  };

  const handleAdd = async () => {
    try {
      let dArr = await save(editingKey);
      // showLog('saveArr', dArr);
      onAdd && onAdd(dArr.data);
    } catch (e) {
      showWarn(e);
    }
  };

  const handleDelete = async (deleteKey) => {
    try {
      onDelete && onDelete(deleteKey);
      await waitFor(400);
      setEditingKey('');
    } catch (e) {
      showWarn(e);
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const onKeyDown = async (key, dIndex) => {
    let dColumns = columns.filter((l) => l.editable);
    let isLastRow = editingKey === data.length - 1;
    let isLastField = dIndex === dColumns[dColumns.length - 1].dataIndex;
    if (['Tab', 'Enter'].includes(key)) {
      if (isLastField) {
        onBlur(dIndex);
        setEditingKey('');
        if (!isLastRow) {
          edit(data[editingKey + 1]);
        }
      } else if (['productCode'].includes(dIndex)) {
        onBlur(dIndex);
      }
    }
  };

  const onBlur = async (dIndex) => {
    // showLog({ dIndex, editingKey });
    let dArr = await save(editingKey);
    handleSave(dArr.data, dIndex, editingKey);
  };

  let mColumns = GetColumns({
    columns,
    handleEdit,
    handleSelect,
    handleDelete,
    onDelete,
    onBlur,
    onKeyDown,
    isEditing,
    size,
    disabled,
    readOnly,
    deletedButtonAtEnd,
  });

  // showLog({ mColumns, data });
  let totalWidth = mColumns.reduce((sum, elem) => sum + Numb(elem.width), 0);
  let tableWidth = totalWidth > '100%' ? '100%' : totalWidth;

  return (
    <Form form={form} component={false}>
      {() => {
        // showLog({ table_values: values });
        return (
          <Table
            components={{
              body: {
                cell: EditableCell,
              },
            }}
            bordered
            dataSource={data}
            columns={mColumns}
            scroll={
              noScroll
                ? undefined
                : scroll
                  ? { x: tableWidth, y: h(40), ...scroll }
                  : { x: tableWidth, y: h(40) }
            }
            size={size || 'small'}
            locale={locale || { emptyText: 'ไม่มีข้อมูล' }}
            rowClassName={
              rowClassName ||
              ((record) =>
                record?.deleted
                  ? 'deleted-row'
                  : record?.transferCompleted
                    ? 'completed-row'
                    : record?.rejected
                      ? 'rejected-row'
                      : 'editable-row')
            }
            pagination={
              typeof pagination !== 'undefined'
                ? pagination
                : {
                    onChange: cancel,
                    showSizeChanger: true,
                  }
            }
            onRow={(record, rowIndex) => {
              // showLog({ ON_ROW_record: record, rowIndex, editingKey });
              return {
                onClick: () => {
                  if (editingKey !== record.key) {
                    edit(record, rowIndex);
                  }
                },
              };
            }}
            footer={
              typeof footer !== 'undefined'
                ? footer
                : typeof onAdd !== 'undefined' && !disabled && !readOnly
                  ? () =>
                      miniAddButton ? (
                        <Button
                          type="default"
                          size="small"
                          className="mx-2 mb-1 dark:bg-gray-700 dark:border-gray-600 dark:text-gray-300"
                          disabled={disabled || readOnly}
                          onClick={handleAdd}
                          icon={<PlusOutlined />}
                        />
                      ) : (
                        <CustomButton
                          onClick={handleAdd}
                          ghost
                          type="primary"
                          size="small"
                          className="mt-1"
                          disabled={disabled || readOnly}
                          icon={<PlusOutlined />}
                        >
                          เพิ่มรายการ
                        </CustomButton>
                      )
                  : undefined
            }
            {...tableProps}
          />
        );
      }}
    </Form>
  );
};

export default EditableRowTable;
