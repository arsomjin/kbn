import React, { useState } from 'react';
import { 
  Row, 
  Col, 
  Card, 
  Button, 
  Form, 
  Input, 
  Select, 
  Table, 
  Badge, 
  Tag, 
  Progress, 
  Alert, 
  notification,
  Space,
  Divider,
  Typography,
  Switch,
  DatePicker,
  InputNumber,
} from 'antd';
import { 
  DollarOutlined, 
  ShoppingCartOutlined, 
  TeamOutlined, 
  TrophyOutlined,
  LeafIcon,
  TreeIcon,
  PlusOutlined,
  EditOutlined,
  DeleteOutlined,
} from '@ant-design/icons';
import NatureDashboardCard, { DashboardIcons } from '../components/enhanced/NatureDashboardCard';
import { NATURE_COLORS } from '../components/theme/NatureThemeProvider';

const { Title, Paragraph, Text } = Typography;
const { Option } = Select;

/**
 * Nature Theme Demo Page
 * Showcases all the enhanced components with nature-inspired design
 */

const NatureThemeDemo = () => {
  const [form] = Form.useForm();
  const [darkMode, setDarkMode] = useState(false);

  // Sample data for demonstrations
  const tableData = [
    {
      key: '1',
      name: 'แจ็ค โจห์นสัน',
      department: 'ขาย',
      sales: 125000,
      status: 'active',
      performance: 95,
    },
    {
      key: '2',
      name: 'เอมิลี่ เดวิส',
      department: 'การตลาด',
      sales: 98000,
      status: 'active',
      performance: 88,
    },
    {
      key: '3',
      name: 'ไมเคิล วิลสัน',
      department: 'คลังสินค้า',
      sales: 76000,
      status: 'pending',
      performance: 92,
    },
  ];

  const tableColumns = [
    {
      title: 'ชื่อพนักงาน',
      dataIndex: 'name',
      key: 'name',
      render: (text) => <Text strong style={{ color: NATURE_COLORS.textPrimary }}>{text}</Text>,
    },
    {
      title: 'แผนก',
      dataIndex: 'department',
      key: 'department',
      render: (dept) => (
        <Tag style={{ 
          background: `rgba(45, 80, 22, 0.1)`, 
          color: NATURE_COLORS.primary,
          border: `1px solid rgba(45, 80, 22, 0.2)`,
          borderRadius: '8px',
        }}>
          {dept}
        </Tag>
      ),
    },
    {
      title: 'ยอดขาย',
      dataIndex: 'sales',
      key: 'sales',
      render: (sales) => (
        <Text style={{ color: NATURE_COLORS.success, fontWeight: 600 }}>
          ฿{sales.toLocaleString()}
        </Text>
      ),
    },
    {
      title: 'สถานะ',
      dataIndex: 'status',
      key: 'status',
      render: (status) => (
        <Badge 
          status={status === 'active' ? 'success' : 'processing'} 
          text={status === 'active' ? 'ใช้งาน' : 'รอดำเนินการ'}
          style={{ color: NATURE_COLORS.textSecondary }}
        />
      ),
    },
    {
      title: 'ประสิทธิภาพ',
      dataIndex: 'performance',
      key: 'performance',
      render: (perf) => (
        <Progress 
          percent={perf} 
          size="small" 
          strokeColor={NATURE_COLORS.primary}
          trailColor={NATURE_COLORS.grayLighter}
        />
      ),
    },
    {
      title: 'จัดการ',
      key: 'actions',
      render: () => (
        <Space>
          <Button 
            type="primary" 
            size="small" 
            icon={<EditOutlined />}
            style={{ 
              background: NATURE_COLORS.primary,
              borderColor: NATURE_COLORS.primary,
            }}
          >
            แก้ไข
          </Button>
          <Button 
            danger 
            size="small" 
            icon={<DeleteOutlined />}
          >
            ลบ
          </Button>
        </Space>
      ),
    },
  ];

  const showNotification = (type) => {
    const config = {
      message: 'ทดสอบการแจ้งเตือน Nature Theme',
      description: 'นี่คือตัวอย่างการแจ้งเตือนที่ใช้ธีม Nature ที่สวยงามและเป็นมิตรกับสิ่งแวดล้อม',
      placement: 'topRight',
      style: {
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)',
      },
    };

    if (type === 'success') {
      notification.success({
        ...config,
        message: 'สำเร็จ! Nature Theme ทำงานได้ดี',
      });
    } else if (type === 'warning') {
      notification.warning({
        ...config,
        message: 'คำเตือน! ตรวจสอบการตั้งค่า',
      });
    } else if (type === 'error') {
      notification.error({
        ...config,
        message: 'ข้อผิดพลาด! กรุณาลองใหม่',
      });
    } else {
      notification.info(config);
    }
  };

  return (
    <div style={{ 
      padding: '24px', 
      background: NATURE_COLORS.bgSecondary,
      minHeight: '100vh',
    }}>
      {/* Header Section */}
      <Card 
        className="nature-card"
        style={{ 
          marginBottom: '24px',
          background: `linear-gradient(135deg, ${NATURE_COLORS.primary} 0%, ${NATURE_COLORS.primaryLight} 100%)`,
          color: 'white',
          border: 'none',
        }}
      >
        <Row align="middle" justify="space-between">
          <Col>
            <Title level={2} style={{ color: 'white', margin: 0 }}>
              🌿 KBN Nature Theme Demo
            </Title>
            <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
              ระบบธีมธรรมชาติที่สวยงาม เป็นมิตรกับผู้ใช้ และทันสมัย
            </Paragraph>
          </Col>
          <Col>
            <Space>
              <Text style={{ color: 'white' }}>Dark Mode:</Text>
              <Switch 
                checked={darkMode} 
                onChange={setDarkMode}
                style={{ background: darkMode ? NATURE_COLORS.success : NATURE_COLORS.grayLight }}
              />
            </Space>
          </Col>
        </Row>
      </Card>

      {/* Dashboard Cards Section */}
      <Title level={3} style={{ color: NATURE_COLORS.textPrimary, marginBottom: '16px' }}>
        📊 Enhanced Dashboard Cards
      </Title>
      
      <Row gutter={[16, 16]} style={{ marginBottom: '32px' }}>
        <Col xs={24} sm={12} md={6}>
          <NatureDashboardCard
            title="ยอดขายรวม"
            value={2456789}
            prefix="฿"
            trend="up"
            trendValue={12.5}
            icon={DashboardIcons.Sales}
            type="primary"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <NatureDashboardCard
            title="รายได้"
            value={1875432}
            prefix="฿"
            trend="up"
            trendValue={8.3}
            icon={DashboardIcons.Revenue}
            type="secondary"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <NatureDashboardCard
            title="ลูกค้า"
            value={1234}
            trend="up"
            trendValue={5.7}
            icon={DashboardIcons.Users}
            type="success"
          />
        </Col>
        <Col xs={24} sm={12} md={6}>
          <NatureDashboardCard
            title="เป้าหมาย"
            value={89}
            suffix="%"
            trend="down"
            trendValue={2.1}
            icon={DashboardIcons.Achievement}
            type="warning"
          />
        </Col>
      </Row>

      {/* Form Components Section */}
      <Title level={3} style={{ color: NATURE_COLORS.textPrimary, marginBottom: '16px' }}>
        📝 Enhanced Form Components
      </Title>
      
      <Row gutter={24} style={{ marginBottom: '32px' }}>
        <Col xs={24} lg={12}>
          <Card 
            title="ฟอร์มตัวอย่าง" 
            className="nature-card"
            style={{ height: '100%' }}
          >
            <Form
              form={form}
              layout="vertical"
              className="nature-form"
              initialValues={{
                customerName: '',
                department: '',
                amount: 0,
                date: null,
              }}
            >
              <Form.Item 
                label="ชื่อลูกค้า" 
                name="customerName"
                className="nature-form-item"
              >
                <Input 
                  placeholder="กรอกชื่อลูกค้า"
                  className="nature-form-input"
                  style={{ 
                    borderColor: NATURE_COLORS.grayLighter,
                    borderRadius: '8px',
                  }}
                />
              </Form.Item>
              
              <Form.Item label="แผนก" name="department">
                <Select 
                  placeholder="เลือกแผนก"
                  style={{ borderRadius: '8px' }}
                >
                  <Option value="sales">ฝ่ายขาย</Option>
                  <Option value="marketing">ฝ่ายการตลาด</Option>
                  <Option value="warehouse">คลังสินค้า</Option>
                </Select>
              </Form.Item>
              
              <Row gutter={12}>
                <Col span={12}>
                  <Form.Item label="จำนวนเงิน" name="amount">
                    <InputNumber 
                      placeholder="0"
                      style={{ width: '100%', borderRadius: '8px' }}
                      formatter={value => `฿ ${value}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}
                    />
                  </Form.Item>
                </Col>
                <Col span={12}>
                  <Form.Item label="วันที่" name="date">
                    <DatePicker 
                      style={{ width: '100%', borderRadius: '8px' }}
                      placeholder="เลือกวันที่"
                    />
                  </Form.Item>
                </Col>
              </Row>
              
              <Form.Item>
                <Space>
                  <Button 
                    type="primary" 
                    htmlType="submit"
                    className="nature-btn nature-btn-primary"
                    icon={<PlusOutlined />}
                    style={{ 
                      background: NATURE_COLORS.primary,
                      borderColor: NATURE_COLORS.primary,
                      borderRadius: '8px',
                    }}
                  >
                    บันทึกข้อมูล
                  </Button>
                  <Button 
                    className="nature-btn nature-btn-outline"
                    style={{ 
                      borderColor: NATURE_COLORS.primary,
                      color: NATURE_COLORS.primary,
                      borderRadius: '8px',
                    }}
                  >
                    ยกเลิก
                  </Button>
                </Space>
              </Form.Item>
            </Form>
          </Card>
        </Col>
        
        <Col xs={24} lg={12}>
          <Card 
            title="การแจ้งเตือนและสถานะ" 
            className="nature-card"
            style={{ height: '100%' }}
          >
            <Space direction="vertical" style={{ width: '100%' }}>
              <Alert
                message="สำเร็จ!"
                description="ระบบ Nature Theme ทำงานได้ปกติ"
                type="success"
                showIcon
                style={{ borderRadius: '8px' }}
              />
              
              <Alert
                message="ข้อมูล"
                description="ธีมนี้ออกแบบมาเพื่อความสวยงามและใช้งานง่าย"
                type="info"
                showIcon
                style={{ borderRadius: '8px' }}
              />
              
              <Space wrap>
                <Button 
                  type="primary"
                  onClick={() => showNotification('success')}
                  style={{ background: NATURE_COLORS.success }}
                >
                  แจ้งเตือนสำเร็จ
                </Button>
                <Button 
                  onClick={() => showNotification('warning')}
                  style={{ 
                    background: NATURE_COLORS.warning,
                    color: 'white',
                    border: 'none',
                  }}
                >
                  แจ้งเตือนคำเตือน
                </Button>
                <Button 
                  danger
                  onClick={() => showNotification('error')}
                >
                  แจ้งเตือนข้อผิดพลาด
                </Button>
                <Button 
                  onClick={() => showNotification('info')}
                  style={{ 
                    background: NATURE_COLORS.info,
                    color: 'white',
                    border: 'none',
                  }}
                >
                  แจ้งเตือนข้อมูล
                </Button>
              </Space>
              
              <Divider />
              
              <Space wrap>
                <Tag style={{ 
                  background: `rgba(45, 80, 22, 0.1)`, 
                  color: NATURE_COLORS.primary,
                  border: `1px solid rgba(45, 80, 22, 0.2)`,
                  borderRadius: '6px',
                }}>
                  ธีมธรรมชาติ
                </Tag>
                <Tag style={{ 
                  background: `rgba(82, 196, 26, 0.1)`, 
                  color: NATURE_COLORS.secondary,
                  border: `1px solid rgba(82, 196, 26, 0.2)`,
                  borderRadius: '6px',
                }}>
                  เป็นมิตรกับสิ่งแวดล้อม
                </Tag>
                <Tag style={{ 
                  background: `rgba(139, 69, 19, 0.1)`, 
                  color: NATURE_COLORS.earth,
                  border: `1px solid rgba(139, 69, 19, 0.2)`,
                  borderRadius: '6px',
                }}>
                  โทนสีดิน
                </Tag>
              </Space>
            </Space>
          </Card>
        </Col>
      </Row>

      {/* Table Section */}
      <Title level={3} style={{ color: NATURE_COLORS.textPrimary, marginBottom: '16px' }}>
        📋 Enhanced Data Table
      </Title>
      
      <Card className="nature-card" style={{ marginBottom: '32px' }}>
        <Table
          columns={tableColumns}
          dataSource={tableData}
          className="nature-table"
          style={{
            background: NATURE_COLORS.bgPrimary,
            borderRadius: '8px',
            overflow: 'hidden',
          }}
          pagination={{
            pageSize: 5,
            showSizeChanger: true,
            showQuickJumper: true,
            showTotal: (total, range) => 
              `${range[0]}-${range[1]} จาก ${total} รายการ`,
          }}
        />
      </Card>

      {/* Footer */}
      <Card 
        className="nature-card"
        style={{ 
          background: `linear-gradient(135deg, ${NATURE_COLORS.earth} 0%, ${NATURE_COLORS.earthLight} 100%)`,
          color: 'white',
          border: 'none',
          textAlign: 'center',
        }}
      >
        <Title level={4} style={{ color: 'white', margin: 0 }}>
          🌱 KBN Nature Theme
        </Title>
        <Paragraph style={{ color: 'rgba(255, 255, 255, 0.9)', margin: 0 }}>
          ระบบธีมที่ผสมผสานความสวยงามของธรรมชาติเข้ากับการใช้งานที่ทันสมัย
        </Paragraph>
      </Card>
    </div>
  );
};

export default NatureThemeDemo; 