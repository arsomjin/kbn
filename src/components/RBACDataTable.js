/**
 * RBAC Data Table Component for KBN Multi-Province System
 * Enhanced table with automatic geographic filtering and permission-based actions
 */

import React, { useMemo, useState } from 'react';
import PropTypes from 'prop-types';
import { Table, Button, Space, Tooltip, Tag } from 'antd';
import { 
  EditOutlined, 
  DeleteOutlined, 
  EyeOutlined,
  LockOutlined,
  GlobalOutlined,
  BankOutlined
} from '@ant-design/icons';
import { usePermissions } from '../hooks/usePermissions';
import PermissionGate from './PermissionGate';

/**
 * RBAC Data Table Component
 * @param {Object} props
 * @param {Array} props.dataSource - Table data source
 * @param {Array} props.columns - Table columns configuration
 * @param {Object} props.rbacConfig - RBAC configuration
 * @param {Function} props.onView - View action handler
 * @param {Function} props.onEdit - Edit action handler  
 * @param {Function} props.onDelete - Delete action handler
 * @param {boolean} props.showGeographicInfo - Show province/branch info
 * @param {Object} props.geographicFields - Geographic field mapping
 * @param {Object} props.actionPermissions - Action permission mapping
 * @param {...Object} props.tableProps - Additional Table props
 */
const RBACDataTable = (props) => {
  const {
    dataSource = [],
    columns = [],
    rbacConfig = {},
    onView,
    onEdit,
    onDelete,
    showGeographicInfo = false,
    geographicFields = {
      province: 'provinceId',
      branch: 'branchCode'
    },
    actionPermissions = {
      view: 'view_data',
      edit: 'edit_data', 
      delete: 'delete_data'
    },
    ...tableProps
  } = props;
  const { 
    filterDataByUserAccess, 
    hasGeographicAccess,
    isSuperAdmin
  } = usePermissions();

  const [selectedRowKeys, setSelectedRowKeys] = useState([]);

  // Filter data based on user's geographic access
  const filteredData = useMemo(() => {
    if (isSuperAdmin) {
      return dataSource;
    }

    return filterDataByUserAccess(dataSource, {
      provinceField: geographicFields.province,
      branchField: geographicFields.branch
    });
  }, [dataSource, filterDataByUserAccess, geographicFields, isSuperAdmin]);

  // Add geographic info columns if requested
  const enhancedColumns = useMemo(() => {
    let cols = [...columns];

    if (showGeographicInfo) {
      // Add province column
      if (geographicFields.province && !cols.find(col => col.dataIndex === geographicFields.province)) {
        cols.push({
          title: 'จังหวัด',
          dataIndex: geographicFields.province,
          key: 'province_info',
          width: 120,
          render: (provinceId, record) => {
            const hasAccess = hasGeographicAccess({ 
              province: provinceId,
              branch: record[geographicFields.branch] 
            });
            
            return (
              <Space>
                <Tag color={hasAccess ? 'green' : 'orange'} icon={<GlobalOutlined />}>
                  {provinceId || 'N/A'}
                </Tag>
                {!hasAccess && (
                  <Tooltip title="Limited Access">
                    <LockOutlined style={{ color: '#ff7875' }} />
                  </Tooltip>
                )}
              </Space>
            );
          }
        });
      }

      // Add branch column
      if (geographicFields.branch && !cols.find(col => col.dataIndex === geographicFields.branch)) {
        cols.push({
          title: 'สาขา',
          dataIndex: geographicFields.branch,
          key: 'branch_info',
          width: 100,
          render: (branchCode, record) => {
            const hasAccess = hasGeographicAccess({ 
              province: record[geographicFields.province],
              branch: branchCode 
            });
            
            return (
              <Space>
                <Tag color={hasAccess ? 'blue' : 'default'} icon={<BankOutlined />}>
                  {branchCode || 'N/A'}
                </Tag>
                {!hasAccess && (
                  <Tooltip title="No Branch Access">
                    <LockOutlined style={{ color: '#ff7875' }} />
                  </Tooltip>
                )}
              </Space>
            );
          }
        });
      }
    }

    // Add actions column if any action handlers are provided
    if (onView || onEdit || onDelete) {
      const actionsColumn = {
        title: 'การดำเนินการ',
        key: 'actions',
        width: 120,
        fixed: 'right',
        render: (_, record) => {
          const recordProvince = record[geographicFields.province];
          const recordBranch = record[geographicFields.branch];
          
          return (
            <Space size="small">
              {onView && (
                <PermissionGate 
                  permission={actionPermissions.view}
                  province={recordProvince}
                  branch={recordBranch}
                >
                  <Tooltip title="ดูรายละเอียด">
                    <Button 
                      type="text" 
                      icon={<EyeOutlined />} 
                      size="small"
                      onClick={() => onView(record)}
                    />
                  </Tooltip>
                </PermissionGate>
              )}
              
              {onEdit && (
                <PermissionGate 
                  permission={actionPermissions.edit}
                  province={recordProvince}
                  branch={recordBranch}
                >
                  <Tooltip title="แก้ไข">
                    <Button 
                      type="text" 
                      icon={<EditOutlined />} 
                      size="small"
                      onClick={() => onEdit(record)}
                    />
                  </Tooltip>
                </PermissionGate>
              )}
              
              {onDelete && (
                <PermissionGate 
                  permission={actionPermissions.delete}
                  province={recordProvince}
                  branch={recordBranch}
                >
                  <Tooltip title="ลบ">
                    <Button 
                      type="text" 
                      danger
                      icon={<DeleteOutlined />} 
                      size="small"
                      onClick={() => onDelete(record)}
                    />
                  </Tooltip>
                </PermissionGate>
              )}
            </Space>
          );
        }
      };

      // Check if actions column already exists
      const actionsIndex = cols.findIndex(col => col.key === 'actions');
      if (actionsIndex >= 0) {
        cols[actionsIndex] = actionsColumn;
      } else {
        cols.push(actionsColumn);
      }
    }

    return cols;
  }, [
    columns, 
    showGeographicInfo, 
    geographicFields, 
    onView, 
    onEdit, 
    onDelete,
    actionPermissions,
    hasGeographicAccess
  ]);

  // Row selection with permission checking
  const rowSelection = useMemo(() => {
    if (!rbacConfig.enableSelection) {
      return undefined;
    }

    return {
      selectedRowKeys,
      onChange: setSelectedRowKeys,
      getCheckboxProps: (record) => {
        // Disable selection for records user can't access
        const hasAccess = hasGeographicAccess({
          province: record[geographicFields.province],
          branch: record[geographicFields.branch]
        });

        return {
          disabled: !hasAccess,
          name: record.key || record.id
        };
      }
    };
  }, [selectedRowKeys, rbacConfig.enableSelection, hasGeographicAccess, geographicFields]);

  // Table summary with access info
  const summary = (pageData) => {
    if (!rbacConfig.showSummary) {
      return null;
    }

    const totalRecords = pageData.length;
    const accessibleRecords = pageData.filter(record => 
      hasGeographicAccess({
        province: record[geographicFields.province],
        branch: record[geographicFields.branch]
      })
    ).length;

    return (
      <Table.Summary fixed>
        <Table.Summary.Row>
          <Table.Summary.Cell index={0} colSpan={enhancedColumns.length}>
            <Space>
              <span>ทั้งหมด: <strong>{totalRecords}</strong> รายการ</span>
              {totalRecords !== accessibleRecords && (
                <span style={{ color: '#ff7875' }}>
                  เข้าถึงได้: <strong>{accessibleRecords}</strong> รายการ
                </span>
              )}
            </Space>
          </Table.Summary.Cell>
        </Table.Summary.Row>
      </Table.Summary>
    );
  };

  return (
    <Table
      dataSource={filteredData}
      columns={enhancedColumns}
      rowSelection={rowSelection}
      summary={rbacConfig.showSummary ? summary : undefined}
      scroll={{ x: 'max-content' }}
      {...tableProps}
    />
  );
};

RBACDataTable.propTypes = {
  dataSource: PropTypes.array.isRequired,
  columns: PropTypes.array.isRequired,
  rbacConfig: PropTypes.shape({
    enableSelection: PropTypes.bool,
    showSummary: PropTypes.bool
  }),
  onView: PropTypes.func,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  showGeographicInfo: PropTypes.bool,
  geographicFields: PropTypes.shape({
    province: PropTypes.string,
    branch: PropTypes.string
  }),
  actionPermissions: PropTypes.shape({
    view: PropTypes.string,
    edit: PropTypes.string,
    delete: PropTypes.string
  })
};

/**
 * Higher Order Component for adding RBAC to existing tables
 */
export const withRBACTable = (TableComponent, defaultRBACConfig = {}) => {
  const RBACTableComponent = (props) => {
    const rbacConfig = { ...defaultRBACConfig, ...props.rbacConfig };
    
    return (
      <RBACDataTable
        {...props}
        rbacConfig={rbacConfig}
      />
    );
  };

  RBACTableComponent.displayName = `withRBACTable(${TableComponent.displayName || TableComponent.name})`;
  return RBACTableComponent;
};

/**
 * Hook for table data filtering
 */
export const useRBACTableData = (dataSource, geographicFields) => {
  const { filterDataByUserAccess, isSuperAdmin } = usePermissions();

  return useMemo(() => {
    if (isSuperAdmin) {
      return dataSource;
    }

    return filterDataByUserAccess(dataSource, {
      provinceField: geographicFields?.province || 'provinceId',
      branchField: geographicFields?.branch || 'branchCode'
    });
  }, [dataSource, filterDataByUserAccess, geographicFields, isSuperAdmin]);
};

export default RBACDataTable; 