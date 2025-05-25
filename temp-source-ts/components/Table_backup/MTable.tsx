import React, { useState, useEffect, useContext } from 'react';
import { Table, Popconfirm, Button, Form, Typography } from 'antd';
import type { ColumnType } from 'antd/es/table';
import type { FormInstance } from 'antd';
import type { PanelRender } from 'rc-table/lib/interface';
import type { HTMLAttributes, TdHTMLAttributes } from 'react';
import { DeleteOutlined, EditOutlined, PlusOutlined } from '@ant-design/icons';
import { useSelector } from 'react-redux';
import { useTranslation } from 'react-i18next';
import EditableRow from './EditableRow';
import EditableCell from './EditableCell';
import { getRenderColumns } from './helper';
import { showWarn, waitFor, Numb } from 'utils/functions';
import {
  MTableProps,
  TableData,
  EditingCell,
  CustomColumnType,
  CustomColumnsType,
  asReactChild,
  TableColumnConfig
} from './types';
import { useProvince } from 'hooks/useProvince';
import { usePermissions } from 'hooks/usePermissions';
import './table.css';
import { TableColumnConfig as TableColumnConfigType } from 'types/table';

const { Text } = Typography;

// Example shape for a new row (optional)
const defaultNewRow: Partial<TableData> = {};

/**
 * Enhanced MTable component - combines the functionality of:
 * - MTable: Basic editable table with cell-based editing
 * - EditableCellTable: Cell-by-cell editing functionality
 * - EditableRowTable: Row-based editing functionality
 *
 * The component adapts its behavior based on the provided props.
 */
const MTable: React.FC<MTableProps> = ({
  columns = [],
  dataSource = [],
  onChange,
  defaultRowItem = defaultNewRow,
  readOnly = false,
  canDelete = false,
  canAdd = false,
  canEdit = false,
  permanentDelete = false,
  disabled = false,
  tableProps = {},
  provinceId,
  editMode = 'cell', // 'cell', 'row', or 'inline'
  forceValidate = false,
  scroll,
  size = 'small',
  locale,
  footer,
  noScroll = false,
  miniAddButton = false,
  rowClassName,
  pagination,
  initialItemValues = {},
  onAdd
}) => {
  const { t } = useTranslation();
  const { currentProvince } = useProvince();
  const { hasPermission } = usePermissions();
  const [form] = Form.useForm();
  const [data, setData] = useState<TableData[]>([]);
  const [editingCell, setEditingCell] = useState<EditingCell | null>(null);
  const [editingKey, setEditingKey] = useState<string>('');
  const [count, setCount] = useState<number>(dataSource.length);

  const {
    branches,
    departments,
    userGroups,
    dealers,
    banks,
    expenseCategories,
    employees,
    executives,
    expenseAccountNames
  } = useSelector((state: any) => state.data);

  // Filter data by province if provinceId is provided
  useEffect(() => {
    const filteredData = dataSource.filter(
      item => !provinceId || item.provinceId === provinceId || item.provinceId === currentProvince?.id
    );
    const initData = filteredData.map((item, idx) => ({
      ...item,
      key: item.key || idx.toString()
    }));
    setData(initData);
    setCount(initData.length);
  }, [dataSource, provinceId, currentProvince]);

  // For row-based editing: check if a row is being edited
  const isEditing = (record: TableData) => record.key === editingKey;

  // For row-based editing: start editing a row
  const editRow = async (record: TableData, rowIndex?: number) => {
    try {
      // Save previously editing row if any
      if (editingKey !== '') {
        const dArr = await saveRow(editingKey);
        // Handle save result if needed
      }
      // Set new editing row
      setEditingKey(record.key);
      form.setFieldsValue({
        ...initialItemValues,
        ...record
      });
    } catch (e) {
      showWarn(e instanceof Error ? e.message : String(e));
    }
  };

  // For row-based editing: save a row
  const saveRow = (key: string, isDelete?: boolean) =>
    new Promise<{ item: any; data: any[]; rowIndex: string | number }>(async (resolve, reject) => {
      try {
        // Validate fields
        const row = forceValidate && !isDelete ? await form.validateFields() : await form.getFieldsValue();

        // Save row
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
        } else {
          resolve({ item: row, data: newData, rowIndex: key });
        }
      } catch (errInfo) {
        console.log('Validate Failed:', errInfo);
        reject(errInfo);
      }
    });

  // Cancel row editing
  const cancelEdit = () => {
    setEditingKey('');
  };

  // For cell-based editing
  const handleCellSave = (updatedRow: TableData, dataIndex: string, rowIndex: number) => {
    const newData = [...data];
    const index = newData.findIndex(row => row.key === updatedRow.key);

    if (index > -1) {
      newData[index] = {
        ...updatedRow,
        provinceId: provinceId || currentProvince?.id
      };
      setData(newData);
      onChange?.(newData, dataIndex, rowIndex);
    }
  };

  // Handle adding a new row
  const handleAdd = async () => {
    if (disabled || !hasPermission('CREATE')) return;

    try {
      // For row-based editing, save the current row first
      if (editMode === 'row' && editingKey !== '') {
        const dArr = await saveRow(editingKey);
      }

      if (typeof canAdd === 'function') {
        try {
          const newData = await canAdd(data);
          setData(newData);
          onChange?.(newData, null, -1);
        } catch (err) {
          console.error(err);
        }
      } else {
        const newKey = `${Date.now()}`;
        const newRow = {
          ...defaultRowItem,
          ...initialItemValues,
          _key: newKey,
          key: data.length.toString(),
          id: data.length,
          provinceId: provinceId || currentProvince?.id
        };
        const newData = [...data, newRow];
        setData(newData);
        setCount(count + 1);
        onChange?.(newData, null, -1);

        // If row editing mode, start editing the new row
        if (editMode === 'row') {
          setEditingKey(newRow.key);
          form.setFieldsValue(newRow);
        }
      }
    } catch (e) {
      showWarn(e instanceof Error ? e.message : String(e));
    }
  };

  // Delete a row
  const handleDelete = async (key: string) => {
    if (!hasPermission('DELETE')) return;
    try {
      if (typeof canDelete === 'function') {
        const newData = await canDelete(key);
        setData(newData);
        onChange?.(newData, null, -1);
        return;
      }

      let newData = [...data];

      if (!permanentDelete) {
        const index = newData.findIndex(item => item.key === key);
        if (index > -1) {
          newData[index].deleted = true;
        }
      } else {
        newData = data.filter(item => item.key !== key);
      }

      setData(newData);
      onChange?.(newData, null, -1);

      // If row editing mode, reset editing key
      if (editMode === 'row') {
        await waitFor(400);
        setEditingKey('');
      }
    } catch (e) {
      showWarn(e instanceof Error ? e.message : String(e));
    }
  };

  // Handle edit button click
  const handleEdit = async (record: TableData) => {
    if (!hasPermission('UPDATE')) return;
    const cannotEdit = record?.deleted || record?.rejected || record?.completed;
    const rowIndex = data.findIndex(r => r.key === record.key);

    if (!cannotEdit) {
      if (typeof canEdit === 'function') {
        canEdit(record, null, rowIndex);
      } else if (editMode === 'row') {
        editRow(record, rowIndex);
      }
    }
  };

  // Key press handling for row editing mode
  const onKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>, dIndex: string) => {
    if (editMode === 'row') {
      const dColumns = columns.filter(col => 'editable' in col && col.editable) as CustomColumnType<TableData>[];
      const isLastRow = Number(editingKey) === data.length - 1;
      const lastColumn = dColumns.length > 0 ? dColumns[dColumns.length - 1] : null;
      const isLastField = lastColumn && typeof lastColumn.dataIndex === 'string' && dIndex === lastColumn.dataIndex;

      if (['Tab', 'Enter'].includes(e.key)) {
        if (isLastField) {
          onBlur(dIndex);
          setEditingKey('');
          if (!isLastRow) {
            editRow(data[Number(editingKey) + 1]);
          }
        } else if (['productCode'].includes(dIndex)) {
          onBlur(dIndex);
        }
      }
    }
  };

  // Blur handling for row editing mode
  const onBlur = async (dIndex: string) => {
    if (editMode === 'row') {
      const dArr = await saveRow(editingKey);
      onChange?.(dArr.data, dIndex, Number(editingKey));
    }
  };

  // Prepare object for getRenderColumns
  const db = {
    branches,
    departments,
    userGroups,
    dealers,
    banks,
    expenseCategories,
    employees,
    executives,
    expenseAccountNames
  };

  // Apply ellipsis to all columns by default
  const columnsWithEllipsis = columns.map(col => {
    // Create a new column object with proper typing to avoid ReactI18NextChildren issues
    const newCol = { ...col };

    // Safely handle title with proper type handling
    if (typeof newCol.title === 'string') {
      newCol.title = <span title={newCol.title}>{asReactChild(newCol.title)}</span>;
    } else if (typeof newCol.title === 'function') {
      // leave as-is for grouped headers
    } else {
      // If it's not a string, just use it without title attribute
      newCol.title = <span>{asReactChild(newCol.title)}</span>;
    }

    // Set ellipsis property
    newCol.ellipsis = true;

    // Handle children if they exist
    if (Array.isArray((newCol as any).children)) {
      (newCol as any).children = (newCol as any).children.map((childCol: any) => {
        const newChildCol = { ...childCol, ellipsis: true };
        // Apply the same title handling for children
        if (typeof newChildCol.title === 'string') {
          newChildCol.title = <span title={newChildCol.title}>{asReactChild(newChildCol.title)}</span>;
        } else if (typeof newChildCol.title === 'function') {
          // leave as-is
        } else {
          newChildCol.title = <span>{asReactChild(newChildCol.title)}</span>;
        }
        return newChildCol;
      });
    }

    return newCol;
  });

  // Process columns based on editing mode
  const processedColumns =
    editMode === 'row'
      ? columnsWithEllipsis.map(col => {
          if ('editable' in col && col.editable) {
            return {
              ...col,
              onCell: (record: TableData) =>
                ({
                  record,
                  dataIndex: 'dataIndex' in col ? String(col.dataIndex || '') : '',
                  editing: isEditing(record),
                  className: 'editable-cell'
                }) as unknown as HTMLAttributes<any> & TdHTMLAttributes<any>
            };
          }
          return col;
        })
      : columnsWithEllipsis;

  // Use ColumnType for columns
  const mergedCols = getRenderColumns({
    columns: processedColumns,
    db,
    handleSave: (record: TableData) => {
      const dataIndex = '';
      const rowIndex = data.findIndex(item => item.key === record.key);
      handleCellSave(record, dataIndex, rowIndex);
    },
    isEditing: (record: TableData) => record.key === editingKey,
    onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => onKeyDown(e, ''),
    onBlur: () => onBlur(''),
    size
  }) as ColumnType<TableData>[];

  // Add delete column if needed
  if (canDelete && !readOnly && !disabled && hasPermission('DELETE')) {
    const deleteCol: ColumnType<TableData> = {
      title: t('common.delete'),
      dataIndex: '__delete__',
      align: 'center',
      render: (_: unknown, record: TableData) => (
        <Popconfirm
          title={t('common.confirmDelete')}
          onConfirm={() => handleDelete(record.key)}
          okText={t('common.ok')}
          cancelText={t('common.cancel')}
          overlayClassName='my-popconfirm'
        >
          <DeleteOutlined className='text-danger mb-2' />
        </Popconfirm>
      )
    };
    mergedCols.push(deleteCol);
  }

  // Add edit column if needed
  if (editMode === 'row' && !readOnly && canEdit) {
    const editCol: ColumnType<TableData> = {
      title: t('action'),
      dataIndex: 'action',
      width: 100,
      align: 'center',
      render: (_: any, record: TableData) => {
        const editable = isEditing(record);
        return editable ? (
          <span>
            <Typography.Link
              onClick={() => {
                const newData = [...data];
                const index = newData.findIndex(item => record.key === item.key);
                if (index > -1) {
                  const item = newData[index];
                  newData.splice(index, 1, {
                    ...item,
                    ...record
                  });
                  setData(newData);
                  setEditingKey('');
                }
              }}
              style={{ marginRight: 8 }}
            >
              {t('save')}
            </Typography.Link>
            <Popconfirm title={t('sureToCancel')} onConfirm={() => setEditingKey('')}>
              <Typography.Link>{t('cancel')}</Typography.Link>
            </Popconfirm>
          </span>
        ) : (
          <Typography.Link disabled={editingKey !== ''} onClick={() => setEditingKey(record.key)}>
            <EditOutlined />
          </Typography.Link>
        );
      }
    };

    const idIndex = mergedCols.findIndex(col => {
      return col.dataIndex && ['id', 'key'].includes(String(col.dataIndex));
    });
    if (idIndex > -1) {
      mergedCols.splice(idIndex + 1, 0, editCol);
    } else {
      mergedCols.unshift(editCol);
    }
  }

  // Calculate total width for scroll
  const totalWidth = mergedCols.reduce((sum: number, elem: any) => sum + Numb(elem.width || 0), 0);
  const tableWidth = typeof totalWidth === 'number' && totalWidth > 100 ? '100%' : totalWidth;

  // Default footer with add button
  const defaultFooter: PanelRender<TableData> = () =>
    miniAddButton ? (
      <Button type='text' size='small' className='mx-2 mb-1' onClick={handleAdd}>
        <i className='material-icons text-primary'>add</i>
      </Button>
    ) : (
      <Button onClick={handleAdd} className='mt-1' size='small' icon={<PlusOutlined />}>
        {t('common.addItem')}
      </Button>
    );

  // Determine which components to use based on editing mode
  const components = {
    body: {
      row: EditableRow,
      cell: EditableCell
    }
  };

  // Row props for row editing mode
  const getRowProps =
    editMode === 'row'
      ? {
          onRow: (record: TableData, rowIndex?: number) => ({
            onClick: () => {
              if (editingKey !== record.key && !record.deleted && !readOnly) {
                editRow(record, rowIndex);
              }
            }
          })
        }
      : {};

  return (
    <div className='responsive-table-wrapper'>
      {canAdd && !readOnly && !disabled && hasPermission('CREATE') && !footer && (
        <Button onClick={handleAdd} style={{ margin: 8 }}>
          + {t('common.addItem')}
        </Button>
      )}
      <Form form={form} component={false}>
        <Table
          components={components}
          dataSource={data}
          columns={mergedCols}
          rowClassName={
            rowClassName ||
            (record =>
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
                  onChange: editMode === 'row' ? cancelEdit : undefined,
                  showSizeChanger: true
                }
          }
          scroll={
            noScroll ? undefined : scroll ? { x: 'max-content', y: 400, ...scroll } : { x: 'max-content', y: 400 }
          }
          size={size}
          locale={locale || { emptyText: t('common.noData') }}
          bordered
          footer={typeof footer !== 'undefined' ? footer : onAdd && !disabled && !readOnly ? defaultFooter : undefined}
          {...getRowProps}
          {...tableProps}
        />
      </Form>
    </div>
  );
};

export default MTable;
