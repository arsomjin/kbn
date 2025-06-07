/**
 * Component Integration Examples for KBN Multi-Province System
 * Practical examples of integrating RBAC components with existing application components
 */

import React, { useState } from 'react';
import { Card, Space, Typography, Button, Modal, message, Divider } from 'antd';
import { 
  PermissionGate,
  RBACDataTable,
  RBACNavigationFilter,
  ProvinceSelector,
  GeographicBranchSelector
} from '../components';

const { Title, Text, Paragraph } = Typography;

// Example 1: Enhanced Sales Report Table with RBAC
const SalesReportTable = () => {
  const [selectedProvince, setSelectedProvince] = useState(null);
  const [selectedBranch, setSelectedBranch] = useState(null);

  // Mock sales data
  const salesData = [
    {
      key: '1',
      saleId: 'S001',
      customerName: 'บริษัท ABC จำกัด',
      vehicleModel: 'L3408',
      amount: 850000,
      saleDate: '2024-12-15',
      provinceId: 'นครราชสีมา',
      branchCode: '0450',
      salesperson: 'นาย ก สมิท'
    },
    {
      key: '2',
      saleId: 'S002',
      customerName: 'นาง ข สมบูรณ์',
      vehicleModel: 'M8540',
      amount: 1200000,
      saleDate: '2024-12-14',
      provinceId: 'นครสวรรค์',
      branchCode: 'NSN001',
      salesperson: 'นาย ค เจริญ'
    },
    {
      key: '3',
      saleId: 'S003',
      customerName: 'ห้างหุ้นส่วน DEF',
      vehicleModel: 'L3408',
      amount: 950000,
      saleDate: '2024-12-13',
      provinceId: 'นครสวรรค์',
      branchCode: 'NSN002',
      salesperson: 'นาง ง สุขใจ'
    }
  ];

  const columns = [
    {
      title: 'รหัสการขาย',
      dataIndex: 'saleId',
      key: 'saleId',
      width: 120
    },
    {
      title: 'ลูกค้า',
      dataIndex: 'customerName',
      key: 'customerName',
      width: 200
    },
    {
      title: 'รุ่นรถ',
      dataIndex: 'vehicleModel',
      key: 'vehicleModel',
      width: 100
    },
    {
      title: 'ยอดขาย',
      dataIndex: 'amount',
      key: 'amount',
      width: 120,
      render: (amount) => `฿${amount.toLocaleString()}`
    },
    {
      title: 'วันที่ขาย',
      dataIndex: 'saleDate',
      key: 'saleDate',
      width: 120
    },
    {
      title: 'พนักงานขาย',
      dataIndex: 'salesperson',
      key: 'salesperson',
      width: 150
    }
  ];

  const handleView = (record) => {
    message.info(`ดูรายละเอียดการขาย: ${record.saleId}`);
  };

  const handleEdit = (record) => {
    message.info(`แก้ไขการขาย: ${record.saleId}`);
  };

  const handleDelete = (record) => {
    Modal.confirm({
      title: 'ยืนยันการลบ',
      content: `ต้องการลบการขาย ${record.saleId} หรือไม่?`,
      onOk: () => {
        message.success('ลบการขายเรียบร้อยแล้ว');
      }
    });
  };

  return (
    <Card title="ตารางรายงานการขาย - RBAC Enhanced" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        {/* Filter Controls */}
        <Space wrap>
          <Text strong>กรองข้อมูล:</Text>
          <ProvinceSelector
            placeholder="เลือกจังหวัด"
            value={selectedProvince}
            onChange={setSelectedProvince}
            allowClear
            style={{ width: 180 }}
          />
          <GeographicBranchSelector
            placeholder="เลือกสาขา"
            province={selectedProvince}
            value={selectedBranch}
            onChange={setSelectedBranch}
            allowClear
            style={{ width: 180 }}
          />
        </Space>

        {/* RBAC Data Table */}
        <RBACDataTable
          dataSource={salesData}
          columns={columns}
          onView={handleView}
          onEdit={handleEdit}
          onDelete={handleDelete}
          showGeographicInfo={true}
          actionPermissions={{
            view: 'view_sales',
            edit: 'edit_sales',
            delete: 'delete_sales'
          }}
          rbacConfig={{
            enableSelection: true,
            showSummary: true
          }}
          size="small"
          scroll={{ x: 1200 }}
        />
      </Space>
    </Card>
  );
};

// Example 2: Navigation Menu with RBAC Filtering
const NavigationExample = () => {
  const menuItems = [
    {
      key: 'overview',
      title: 'ภาพรวม',
      permission: 'view_overview'
    },
    {
      key: 'sales',
      title: 'การขาย',
      permissions: ['view_sales', 'create_sales'],
      children: [
        {
          key: 'sales-vehicles',
          title: 'ขายรถ',
          permission: 'view_sales'
        },
        {
          key: 'sales-parts',
          title: 'ขายอะไหล่',
          permission: 'view_parts_sales'
        }
      ]
    },
    {
      key: 'reports',
      title: 'รายงาน',
      permission: 'view_reports',
      minAccessLevel: 'branch',
      children: [
        {
          key: 'sales-reports',
          title: 'รายงานการขาย',
          permission: 'view_sales_reports'
        },
        {
          key: 'financial-reports',
          title: 'รายงานการเงิน',
          permission: 'view_financial_reports',
          minAccessLevel: 'province'
        }
      ]
    },
    {
      key: 'settings',
      title: 'ตั้งค่า',
      permission: 'manage_settings',
      minAccessLevel: 'province',
      children: [
        {
          key: 'provinces',
          title: 'จัดการจังหวัด',
          permission: 'manage_provinces',
          minAccessLevel: 'all'
        },
        {
          key: 'branches',
          title: 'จัดการสาขา',
          permission: 'manage_branches'
        }
      ]
    }
  ];

  return (
    <Card title="เมนูนำทางพร้อม RBAC" size="small">
      <RBACNavigationFilter menuItems={menuItems}>
        {(filteredItems) => (
          <Space direction="vertical" style={{ width: '100%' }}>
            <Text type="secondary">
              เมนูที่แสดงขึ้นอยู่กับสิทธิ์ของผู้ใช้ปัจจุบัน
            </Text>
            {filteredItems.map((item) => (
              <div key={item.key} style={{ marginBottom: 16 }}>
                <Button type="link" size="large">
                  {item.title}
                </Button>
                {item.children && item.children.length > 0 && (
                  <div style={{ marginLeft: 24 }}>
                    {item.children.map((child) => (
                      <div key={child.key} style={{ marginBottom: 8 }}>
                        <Button type="text" size="small">
                          • {child.title}
                        </Button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </Space>
        )}
      </RBACNavigationFilter>
    </Card>
  );
};

// Example 3: Province-Specific Operations
const ProvinceOperationsExample = () => {
  const [selectedProvince, setSelectedProvince] = useState(null);

  return (
    <Card title="การดำเนินการเฉพาะจังหวัด" size="small">
      <Space direction="vertical" style={{ width: '100%' }}>
        <Space>
          <Text strong>เลือกจังหวัด:</Text>
          <ProvinceSelector
            value={selectedProvince}
            onChange={setSelectedProvince}
            placeholder="เลือกจังหวัดที่ต้องการดำเนินการ"
            style={{ width: 200 }}
          />
        </Space>

        <Divider />

        {selectedProvince && (
          <Space direction="vertical">
            <Title level={5}>การดำเนินการสำหรับ: {selectedProvince}</Title>
            
            <PermissionGate 
              permission="view_province_reports"
              province={selectedProvince}
            >
              <Button type="primary">
                ดูรายงานจังหวัด {selectedProvince}
              </Button>
            </PermissionGate>

            <PermissionGate 
              permission="manage_branches_in_province"
              province={selectedProvince}
            >
              <Button>
                จัดการสาขาในจังหวัด {selectedProvince}
              </Button>
            </PermissionGate>

            <PermissionGate 
              permission="export_province_data"
              province={selectedProvince}
            >
              <Button>
                ส่งออกข้อมูลจังหวัด {selectedProvince}
              </Button>
            </PermissionGate>
          </Space>
        )}
      </Space>
    </Card>
  );
};

// Main Component Integration Examples
const ComponentIntegrationExamples = () => {
  return (
    <div style={{ padding: 24 }}>
      <Title level={2}>การผสานรวม RBAC Components</Title>
      <Paragraph>
        ตัวอย่างการใช้งาน RBAC Components ในสถานการณ์จริง
      </Paragraph>

      <Space direction="vertical" size="large" style={{ width: '100%' }}>
        <SalesReportTable />
        <NavigationExample />
        <ProvinceOperationsExample />
      </Space>
    </div>
  );
};

export default ComponentIntegrationExamples; 