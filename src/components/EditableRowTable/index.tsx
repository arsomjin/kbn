import React, { useEffect, useState, useRef } from 'react';
import { Table, Form } from 'antd';
import type { TablePaginationConfig } from 'antd/es/table';
import { PlusOutlined } from '@ant-design/icons';
import { EditableCell } from 'api/Table/EditableCell';
import { GetColumns } from 'api/Table';
import { h } from 'api/Dimension';
import { useAntdUi } from '../../hooks/useAntdUi';
import { waitFor } from 'utils/functions';
import { Button } from 'elements';
import { TableBaseRecord, TableColumnConfig as OrigTableColumnConfig } from 'types/table';

// Override TableColumnConfig to enforce title: React.ReactElement
export interface TableColumnConfig<T extends TableBaseRecord>
  extends Omit<OrigTableColumnConfig<T>, 'title' | 'children'> {
  title: React.ReactElement;
  children?: TableColumnConfig<any>[] | TableColumnConfig<T>[];
}

interface EditableRowTableProps {
  columns: TableColumnConfig<TableBaseRecord>[];
  dataSource: TableBaseRecord[];
  scroll?: {
    x?: number | string;
    y?: number | string;
  };
  size?: 'small' | 'middle' | 'large';
  locale?: {
    emptyText: string;
  };
  footer?: (data: readonly TableBaseRecord[]) => React.ReactNode;
  initialItemValues?: Partial<TableBaseRecord>;
  onAdd?: (data: TableBaseRecord[]) => void;
  onDelete?: (key: string) => void;
  onUpdate?: (data: TableBaseRecord[], dataIndex?: string, rowIndex?: string) => void;
  forceValidate?: boolean | number;
  noScroll?: boolean;
  pagination?: false | TablePaginationConfig;
  miniAddButton?: boolean;
  handleEdit?: (record: TableBaseRecord) => void;
  handleSelect?: (record: TableBaseRecord) => void;
  disabled?: boolean;
  readOnly?: boolean;
  rowClassName?: string | ((record: TableBaseRecord, index: number) => string);
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
  const { message } = useAntdUi();
  const [form] = Form.useForm();
  const [data, setData] = useState<TableBaseRecord[]>(dataSource);
  const [editingKey, setEditingKey] = useState<string>('');
  const lastEditedField = useRef<string | undefined>(undefined);

  const isEditing = (record: TableBaseRecord) => record.key === editingKey;

  useEffect(() => {
    const row = form.getFieldsValue();
    const editKey = dataSource.findIndex(l => l.key === editingKey);
    if (editKey > -1) {
      const mUpdate: Record<string, any> = {};
      Object.keys(row).forEach(k => {
        mUpdate[k] = dataSource[editKey][k];
      });
      form.setFieldsValue(mUpdate);
    }
    setData(dataSource);
  }, [dataSource, editingKey, form]);

  const edit = async (record: TableBaseRecord, rowIndex: number) => {
    try {
      const dArr = await save(editingKey);
      setEditingKey(record.key);
      form.setFieldsValue({
        ...initialItemValues,
        ...record
      });
      handleSave(dArr.data, undefined, rowIndex.toString());
    } catch (e) {
      message.warning(e instanceof Error ? e.message : String(e));
    }
  };

  const save = (key: string, isDelete?: boolean) =>
    new Promise<{ item: TableBaseRecord; data: TableBaseRecord[]; rowIndex: string }>(async (resolve, reject) => {
      try {
        const shouldValidate = forceValidate === true || forceValidate === 0;
        const row = shouldValidate && !isDelete ? await form.validateFields() : await form.getFieldsValue();

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
          resolve({ item: { ...item, ...mRow }, data: newData, rowIndex: key });
        }
        resolve({ item: row as TableBaseRecord, data: newData, rowIndex: key });
      } catch (errInfo) {
        console.log('Validate Failed:', errInfo);
        reject(errInfo);
      }
    });

  const handleSave = (arr: TableBaseRecord[], dataIndex?: string, rowIndex?: string) => {
    onUpdate?.(arr, dataIndex, rowIndex);
  };

  const handleAdd = async () => {
    try {
      const dArr = await save(editingKey);
      onAdd?.(dArr.data);
    } catch (e) {
      message.warning(e instanceof Error ? e.message : String(e));
    }
  };

  const handleDelete = async (deleteKey: string) => {
    try {
      onDelete?.(deleteKey);
      await waitFor(400);
      setEditingKey('');
    } catch (e) {
      message.warning(e instanceof Error ? e.message : String(e));
    }
  };

  const cancel = () => {
    setEditingKey('');
  };

  const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, dIndex: string) => {
    const dColumns = columns.filter(l => l.editable);
    const isLastRow = editingKey === (data.length - 1).toString();
    const isLastField = dColumns.length > 0 && dIndex === dColumns[dColumns.length - 1].dataIndex;
    if (['Tab', 'Enter'].includes(e.key)) {
      if (isLastField) {
        onBlur(dIndex);
        setEditingKey('');
        if (!isLastRow) {
          edit(data[parseInt(editingKey) + 1], parseInt(editingKey) + 1);
        }
      } else if (['productCode'].includes(dIndex)) {
        onBlur(dIndex);
      }
    }
  };

  const onBlur = async (dIndex: string) => {
    const dArr = await save(editingKey);
    const dataIndexToUse = lastEditedField.current || dIndex;
    handleSave(dArr.data, dataIndexToUse, editingKey);
    lastEditedField.current = undefined;
  };

  // Handler to update data and call onUpdate when a value changes
  const handleValuesChange = (changedValues: any, allValues: any) => {
    if (!editingKey) return;
    const changedField = Object.keys(changedValues)[0];
    lastEditedField.current = changedField;
    const rowIndex = data.findIndex(item => item.key === editingKey);
    const newData = data.map(item => {
      if (item.key === editingKey) {
        return { ...item, ...allValues };
      }
      return item;
    });
    // Debug logging
    console.log('[EditableRowTable] onValuesChange:', {
      changedValues,
      allValues,
      editingKey,
      changedField,
      rowIndex,
      newData
    });
    setData(newData);
    onUpdate?.(newData, changedField, rowIndex.toString());
  };

  const mColumns = GetColumns({
    columns,
    handleEdit,
    handleSelect,
    handleDelete,
    onDelete,
    onBlur: () => onBlur(''),
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown(e, ''),
    isEditing,
    size,
    disabled,
    readOnly,
    deletedButtonAtEnd
  }) as TableColumnConfig<TableBaseRecord>[];

  const totalWidth = mColumns.reduce((sum: number, elem) => {
    const width = typeof elem.width === 'number' ? elem.width : 0;
    return sum + width;
  }, 0);

  const tableWidth = typeof totalWidth === 'number' && totalWidth > 100 ? '100%' : totalWidth;

  return (
    <Form form={form} component={false} onValuesChange={handleValuesChange}>
      <Table
        components={{
          body: {
            cell: EditableCell
          }
        }}
        bordered
        dataSource={data}
        columns={mColumns}
        scroll={noScroll ? undefined : scroll ? { ...scroll, x: tableWidth } : { x: tableWidth, y: h(40) }}
        size={size || 'small'}
        locale={locale || { emptyText: 'ไม่มีข้อมูล' }}
        rowClassName={
          rowClassName ||
          ((record, index) =>
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
                showSizeChanger: true
              }
        }
        onRow={(record, rowIndex) => ({
          onClick: () => {
            if (editingKey !== record.key && typeof rowIndex === 'number') {
              edit(record, rowIndex);
            }
          }
        })}
        footer={
          typeof footer !== 'undefined'
            ? footer
            : typeof onAdd !== 'undefined' && !disabled && !readOnly
              ? () => (
                  <Button
                    onClick={handleAdd}
                    ghost
                    type='primary'
                    size='small'
                    className='mt-1'
                    disabled={disabled || readOnly}
                    icon={<PlusOutlined />}
                  >
                    เพิ่มรายการ
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
