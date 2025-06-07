/**
 * Hierarchical Dashboard Switching Example
 * Demonstrates how higher-level users can view lower-level dashboards
 */

import React from 'react';
import { Card, Typography, List, Tag, Space, Divider } from 'antd';
import { 
  GlobalOutlined, 
  BankOutlined, 
  ShopOutlined, 
  UserOutlined,
  EyeOutlined,
  ArrowRightOutlined
} from '@ant-design/icons';

const { Title, Paragraph, Text } = Typography;

const HierarchicalDashboardExample = () => {
  const roleHierarchy = [
    {
      level: 1,
      role: 'EXECUTIVE',
      name: 'ผู้บริหารระดับสูง',
      icon: <GlobalOutlined style={{ color: '#722ed1' }} />,
      access: ['ดูได้ทุกระดับ', 'เลือกจังหวัด', 'เลือกสาขา'],
      canView: ['Executive', 'Province Manager', 'Branch Manager', 'Staff']
    },
    {
      level: 2,
      role: 'SUPER_ADMIN',
      name: 'ผู้ดูแลระบบ',
      icon: <GlobalOutlined style={{ color: '#1890ff' }} />,
      access: ['ดูได้ทุกระดับ', 'เลือกจังหวัด', 'เลือกสาขา'],
      canView: ['Super Admin', 'Province Manager', 'Branch Manager', 'Staff']
    },
    {
      level: 3,
      role: 'PROVINCE_MANAGER',
      name: 'ผู้จัดการระดับจังหวัด',
      icon: <BankOutlined style={{ color: '#52c41a' }} />,
      access: ['จังหวัดที่รับผิดชอบ', 'สาขาในจังหวัด'],
      canView: ['Province Manager', 'Branch Manager', 'Staff']
    },
    {
      level: 4,
      role: 'BRANCH_MANAGER',
      name: 'ผู้จัดการสาขา',
      icon: <ShopOutlined style={{ color: '#fa8c16' }} />,
      access: ['สาขาที่รับผิดชอบ'],
      canView: ['Branch Manager', 'Staff']
    },
    {
      level: 5,
      role: 'STAFF',
      name: 'เจ้าหน้าที่',
      icon: <UserOutlined style={{ color: '#666' }} />,
      access: ['สาขาตนเอง', 'แผนกตนเอง'],
      canView: ['Staff (own view only)']
    }
  ];

  const useCases = [
    {
      scenario: 'ผู้บริหาร ต้องการดูสถานการณ์สาขานครสวรรค์ 001',
      steps: [
        'เลือกมุมมอง: "ผู้จัดการสาขา"',
        'เลือกจังหวัด: "นครสวรรค์"',
        'เลือกสาขา: "NSN001"',
        'ระบบแสดงแดชบอร์ดสาขา NSN001 ด้วยสิทธิ์ผู้บริหาร'
      ]
    },
    {
      scenario: 'ผู้จัดการจังหวัด ต้องการดูมุมมองเจ้าหน้าที่ขาย',
      steps: [
        'เลือกมุมมอง: "เจ้าหน้าที่"',
        'เลือกสาขาในจังหวัดตนเอง',
        'ระบบแสดงแดชบอร์ดเจ้าหน้าที่ในมุมมองแผนกขาย'
      ]
    },
    {
      scenario: 'ผู้จัดการสาขา ต้องการดูมุมมองทีมงาน',
      steps: [
        'เลือกมุมมอง: "เจ้าหน้าที่"',
        'ระบบแสดงแดชบอร์ดเจ้าหน้าที่ในสาขาตนเอง'
      ]
    }
  ];

  const features = [
    {
      title: 'การเปลี่ยนมุมมอง (Role Switching)',
      description: 'ผู้ใช้ระดับสูงสามารถเลือกดูแดชบอร์ดในมุมมองของบทบาทที่ต่ำกว่า',
      icon: <EyeOutlined style={{ color: '#1890ff' }} />
    },
    {
      title: 'การกรองตามพื้นที่ (Geographic Filtering)',
      description: 'เลือกจังหวัดและสาขาเฉพาะเพื่อดูข้อมูลในบริบทที่ต้องการ',
      icon: <BankOutlined style={{ color: '#52c41a' }} />
    },
    {
      title: 'การรักษาสิทธิ์เดิม (Permission Preservation)',
      description: 'แม้จะเปลี่ยนมุมมอง แต่ยังคงสิทธิ์การเข้าถึงระดับเดิม',
      icon: <ShopOutlined style={{ color: '#fa8c16' }} />
    }
  ];

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      <Title level={2} style={{ textAlign: 'center', marginBottom: '32px' }}>
        <EyeOutlined style={{ marginRight: '12px', color: '#1890ff' }} />
        ระบบแดชบอร์ดแบบลำดับชั้น (Hierarchical Dashboard System)
      </Title>

      <Paragraph style={{ textAlign: 'center', fontSize: '16px', marginBottom: '32px' }}>
        ระบบที่ให้ผู้ใช้ระดับสูงสามารถดูแดชบอร์ดในมุมมองของระดับที่ต่ำกว่าได้ 
        เพื่อเข้าใจมุมมองและประสบการณ์ของทีมงาน
      </Paragraph>

      {/* Role Hierarchy */}
      <Card 
        title="ลำดับชั้นบทบาทและสิทธิ์การเข้าถึง" 
        style={{ marginBottom: '24px' }}
      >
        <List
          dataSource={roleHierarchy}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={item.icon}
                title={
                  <Space>
                    <Text strong>{item.name}</Text>
                    <Tag color="blue">ระดับ {item.level}</Tag>
                  </Space>
                }
                description={
                  <div>
                    <Text type="secondary">สิทธิ์การเข้าถึง: </Text>
                    {item.access.map((access, index) => (
                      <Tag key={index} style={{ margin: '2px' }}>{access}</Tag>
                    ))}
                    <br />
                    <Text type="secondary">สามารถดูมุมมอง: </Text>
                    {item.canView.map((view, index) => (
                      <Tag key={index} color="green" style={{ margin: '2px' }}>{view}</Tag>
                    ))}
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Features */}
      <Card 
        title="คุณสมบัติหลัก" 
        style={{ marginBottom: '24px' }}
      >
        <List
          dataSource={features}
          renderItem={(item) => (
            <List.Item>
              <List.Item.Meta
                avatar={item.icon}
                title={item.title}
                description={item.description}
              />
            </List.Item>
          )}
        />
      </Card>

      {/* Use Cases */}
      <Card title="ตัวอย่างการใช้งาน">
        {useCases.map((useCase, index) => (
          <div key={index} style={{ marginBottom: index < useCases.length - 1 ? '24px' : '0' }}>
            <Title level={4} style={{ color: '#1890ff' }}>
              {useCase.scenario}
            </Title>
            <List
              size="small"
              dataSource={useCase.steps}
              renderItem={(step, stepIndex) => (
                <List.Item>
                  <Space>
                    <Tag color="blue">{stepIndex + 1}</Tag>
                    <Text>{step}</Text>
                  </Space>
                </List.Item>
              )}
            />
            {index < useCases.length - 1 && <Divider />}
          </div>
        ))}
      </Card>

      {/* Implementation Note */}
      <Card 
        style={{ marginTop: '24px', background: '#f6ffed', border: '1px solid #b7eb8f' }}
        title={
          <Space>
            <ArrowRightOutlined style={{ color: '#52c41a' }} />
            <Text style={{ color: '#52c41a' }}>การใช้งานในระบบ</Text>
          </Space>
        }
      >
        <Paragraph>
          <Text strong>สำหรับผู้พัฒนา:</Text> ระบบนี้ได้ถูกผสานเข้ากับ <Text code>EnhancedRoleBasedDashboard</Text> แล้ว
          และจะแสดงอัตโนมัติสำหรับผู้ใช้ที่มีสิทธิ์ระดับ Manager ขึ้นไป
        </Paragraph>
        <Paragraph>
          <Text strong>สำหรับผู้ใช้:</Text> หากคุณเป็น Executive, Super Admin, Province Manager, หรือ Branch Manager 
          คุณจะเห็นตัวเลือกเปลี่ยนมุมมองแดชบอร์ดที่ด้านบนของหน้าแดชบอร์ดหลัก
        </Paragraph>
      </Card>
    </div>
  );
};

export default HierarchicalDashboardExample; 