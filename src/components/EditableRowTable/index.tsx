import React, { useEffect, useState } from 'react';
import { Table, Form } from 'antd';
import { PlusOutlined } from '@ant-design/icons';
import { EditableCell } from 'api/Table/EditableCell';
import { GetColumns } from 'api/Table';
import { showWarn, waitFor } from 'utils/functions';
import { Button } from 'elements';
import { Button as SButton } from 'antd';
import { Numb } from 'utils/functions';

interface EditableRowTableProps {
  columns: any[];
  dataSource: any[];
  scroll?: { x?: number | string; y?: number | string };
  size?: 'small' | 'middle' | 'large';
  locale?: Record<string, string>;
  footer?: (() => React.ReactNode) | undefined;
  initialItemValues?: Record<string, any>;
  onAdd?: (data: any[]) => void;
  onDelete?: (key: string | number) => void;
  onUpdate?: (data: any[], dataIndex: string | null, rowIndex: string | number) => void;
  forceValidate?: boolean | number;
  noScroll?: boolean;
  pagination?: object | false;
  miniAddButton?: boolean;
  handleEdit?: (record: any) => void;
  handleSelect?: (record: any) => void;
  disabled?: boolean;
  readOnly?: boolean;
  rowClassName?: string | ((record: any, index: number) => string);
  deletedButtonAtEnd?: boolean;
  [key: string]: any;
}

const EditableRowTable: React.FC<EditableRowTableProps> = ({
  columns,
  dataSource,
  scroll,
  size,
  locale,
  footer,
  initialItemValues = {},
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
  const [editingKey, setEditingKey] = useState<string | number>('');

  const isEditing = (record: any) => record.key === editingKey;

  useEffect(() => {
    const row = form.getFieldsValue();
    const editKey = dataSource.findIndex(l => l.key === editingKey);
    if (editKey > -1) {
      const mUpdate: Record<string, any> = {};
      Object.keys(row).forEach(k => {
        // Filter only valid fields
        mUpdate[k] = dataSource[editKey][k];
      });
      form.setFieldsValue(mUpdate);
    }
    setData(dataSource);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dataSource]);

  const edit = async (record: any, rowIndex?: number) => {
    try {
      // Save previous editing row.
      const dArr = await save(editingKey);
      // Set new editing row.
      setEditingKey(record.key);
      form.setFieldsValue({
        ...initialItemValues,
        ...record
      });
      handleSave(dArr.data, null, rowIndex ?? record.key);
    } catch (e) {
      showWarn(e instanceof Error ? e.message : String(e));
    }
  };

  const save = (key: string | number, isDelete?: boolean) =>
    new Promise<{ item: any; data: any[]; rowIndex: string | number }>(async (r, j) => {
      try {
        // Validate fields.
        const row =
          (forceValidate || forceValidate === 0) && !isDelete
            ? await form.validateFields()
            : await form.getFieldsValue();
        // Save row.
        const newData = [...data];
        const index = newData.findIndex(item => key === item.key);

        if (index > -1) {
          const item = newData[index];
          const mRow: Record<string, any> = { ...row };
          Object.keys(row).forEach(k => {
            if (row[k] === undefined) {
              mRow[k] = null;
            }
          });
          newData.splice(index, 1, { ...item, ...mRow });
          r({ item: { ...item, ...mRow }, data: newData, rowIndex: key });
        } else {
          r({ item: row, data: newData, rowIndex: key });
        }
      } catch (errInfo) {
        console.log('Validate Failed:', errInfo);
        j(errInfo);
      }
    });

  const handleSave = (arr: any[], dataIndex: string | null, rowIndex: string | number) => {
    onUpdate && onUpdate(arr, dataIndex, rowIndex);
  };

  const handleAdd = async () => {
    try {
      const dArr = await save(editingKey);
      onAdd && onAdd(dArr.data);
    } catch (e) {
      showWarn(e instanceof Error ? e.message : String(e));
    }
  };

  const handleDelete = async (deleteKey: string | number) => {
    try {
      onDelete && onDelete(deleteKey);
      await waitFor(400);
      setEditingKey('');
    } catch (e) {
      showWarn(e instanceof Error ? e.message : String(e));
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, dIndex: string) => {
    const dColumns = columns.filter(l => l.editable);
    const isLastRow = editingKey === data.length - 1;
    const isLastField = dIndex === dColumns[dColumns.length - 1].dataIndex;
    if (['Tab', 'Enter'].includes(e.key)) {
      if (isLastField) {
        onBlur(dIndex);
        setEditingKey('');
        if (!isLastRow) {
          edit(data[Number(editingKey) + 1]);
        }
      } else if (['productCode'].includes(dIndex)) {
        onBlur(dIndex);
      }
    }
  };

  const onBlur = async (dIndex: string) => {
    const dArr = await save(editingKey);
    handleSave(dArr.data, dIndex, editingKey);
  };

  const mColumns = GetColumns({
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
    deletedButtonAtEnd
  });

  const totalWidth = mColumns.reduce((sum: number, elem: any) => sum + Numb(elem.width), 0);
  const tableWidth = totalWidth > 100 ? '100%' : totalWidth;

  return (
    <Form form={form} component={false}>
      <Table
        components={{
          body: {
            cell: EditableCell
          }
        }}
        bordered
        dataSource={data}
        columns={mColumns}
        scroll={
          noScroll 
            ? undefined 
            : scroll 
              ? { x: tableWidth, y: scroll.y || 400, ...scroll } 
              : { x: tableWidth, y: 400 }
        }
        size={size || 'small'}
        locale={locale || { emptyText: 'ไม่มีข้อมูล' }}
        rowClassName={
          rowClassName ||
          ((record, index) =>
            !!record?.deleted
              ? 'deleted-row'
              : !!record?.transferCompleted
                ? 'completed-row'
                : !!record?.rejected
                  ? 'rejected-row'
                  : 'editable-row')
        }
        pagination={
          typeof pagination !== 'undefined'
            ? pagination
            : {
                onChange: cancel,
                showSizeChanger: true
              }
        }
        onRow={(record, rowIndex) => {
          return {
            onClick: () => {
              if (editingKey !== record.key) {
                edit(record, rowIndex);
              }
            }
          };
        }}
        footer={
          typeof footer !== 'undefined'
            ? footer
            : typeof onAdd !== 'undefined' && !disabled && !readOnly
              ? () =>
                  miniAddButton ? (
                    <SButton
                      type="text"
                      size="small"
                      className="mx-2 mb-1"
                      disabled={disabled || readOnly}
                      onClick={handleAdd}
                    >
                      <i className="material-icons text-primary">add</i>
                    </SButton>
                  ) : (
                    <Button
                      onClick={handleAdd}
                      ghost
                      type="primary"
                      size="small"
                      className="mt-1"
                      disabled={disabled || readOnly}
                      icon={<PlusOutlined />}
                    >
                      เพิ่ม
                    </Button>
                  )
              : undefined
        }
        {...tableProps}
      />
    </Form>
  );
};

export default EditableRowTable;
